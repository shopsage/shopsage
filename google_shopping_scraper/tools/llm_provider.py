"""Multi-provider LLM abstraction layer"""

import os
from typing import Optional, Dict, Any
from enum import Enum
from dotenv import load_dotenv

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage

load_dotenv()


class LLMProvider(str, Enum):
    """Supported LLM providers"""

    GEMINI = "gemini"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class LLMClient:
    """
    Multi-provider LLM client with unified interface

    Allows easy switching between different LLM providers
    """

    def __init__(
        self,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        **kwargs,
    ):
        """
        Initialize LLM client

        Args:
            provider: LLM provider name (gemini, openai, anthropic)
            model: Specific model name (uses defaults if not provided)
            temperature: Temperature for generation
            **kwargs: Additional provider-specific parameters
        """
        self.provider = provider or os.getenv("LLM_PROVIDER", "gemini")
        self.temperature = temperature
        self.kwargs = kwargs

        # Default models for each provider
        self.default_models = {
            LLMProvider.GEMINI: "gemini-2.5-flash",
            LLMProvider.OPENAI: "gpt-4o-mini",
            LLMProvider.ANTHROPIC: "claude-3-5-sonnet-20241022",
        }

        self.model = model or self.default_models.get(self.provider)
        self.llm = self._initialize_llm()

    def _initialize_llm(self) -> BaseChatModel:
        """Initialize the appropriate LLM based on provider"""

        if self.provider == LLMProvider.GEMINI:
            from langchain_google_genai import ChatGoogleGenerativeAI

            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError(
                    "GOOGLE_API_KEY environment variable required for Gemini"
                )

            return ChatGoogleGenerativeAI(
                model=self.model,
                google_api_key=api_key,
                temperature=self.temperature,
                **self.kwargs,
            )

        elif self.provider == LLMProvider.OPENAI:
            from langchain_openai import ChatOpenAI

            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError(
                    "OPENAI_API_KEY environment variable required for OpenAI"
                )

            return ChatOpenAI(
                model=self.model,
                api_key=api_key,
                temperature=self.temperature,
                **self.kwargs,
            )

        elif self.provider == LLMProvider.ANTHROPIC:
            from langchain_anthropic import ChatAnthropic

            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise ValueError(
                    "ANTHROPIC_API_KEY environment variable required for Anthropic"
                )

            return ChatAnthropic(
                model=self.model,
                api_key=api_key,
                temperature=self.temperature,
                **self.kwargs,
            )

        else:
            raise ValueError(
                f"Unsupported provider: {self.provider}. "
                f"Choose from: {[p.value for p in LLMProvider]}"
            )

    def invoke(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Invoke the LLM with a prompt

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt

        Returns:
            Dictionary with 'content' key containing the response
        """
        messages = []

        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))

        messages.append(HumanMessage(content=prompt))

        try:
            response = self.llm.invoke(messages)
            return {"content": response.content, "raw_response": response}
        except Exception as e:
            raise Exception(f"LLM invocation failed: {str(e)}")

    def get_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """
        Get a simple completion from the LLM

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            temperature: Override temperature for this call

        Returns:
            String response from LLM
        """
        if temperature is not None:
            # Temporarily override temperature
            original_temp = self.llm.temperature
            self.llm.temperature = temperature

        try:
            result = self.invoke(prompt, system_prompt)
            response = result["content"]

            if temperature is not None:
                # Restore original temperature
                self.llm.temperature = original_temp

            return response

        except Exception as e:
            if temperature is not None:
                self.llm.temperature = original_temp
            raise e

    @staticmethod
    def list_providers() -> list[str]:
        """List all available providers"""
        return [p.value for p in LLMProvider]

    def get_provider_info(self) -> Dict[str, Any]:
        """Get information about current provider configuration"""
        return {
            "provider": self.provider,
            "model": self.model,
            "temperature": self.temperature,
            "available_providers": self.list_providers(),
        }


def get_llm_client(
    provider: Optional[str] = None, temperature: float = 0.7, **kwargs
) -> LLMClient:
    """
    Factory function to get an LLM client

    Args:
        provider: Provider name (defaults to env variable)
        temperature: Temperature setting
        **kwargs: Additional provider parameters

    Returns:
        Initialized LLMClient
    """
    return LLMClient(provider=provider, temperature=temperature, **kwargs)


# Example usage
if __name__ == "__main__":
    # Test the client
    try:
        client = get_llm_client()
        print(f"Provider info: {client.get_provider_info()}")

        response = client.get_completion(
            "Extract the brand and model from this query: 'I want to buy sony wh1000xm6'",
            system_prompt="You are a helpful assistant that extracts product information.",
        )
        print(f"\nResponse: {response}")

    except Exception as e:
        print(f"Error: {e}")
        print("\nMake sure to set up your API keys in .env file")
