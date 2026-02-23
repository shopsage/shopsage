import dotenv
import os
import asyncpraw
from datetime import datetime, timezone
from asyncpraw.models import MoreComments
from typing import Set

dotenv.load_dotenv()

class RedditClient:
    def __init__(self):
        self.client_id = os.getenv("REDDIT_CLIENT_ID")
        self.client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        self.user_agent = "Reddit Scraper v1.0"
        
        if not self.client_id or not self.client_secret:
            raise ValueError("REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET must be set")
            
    async def _extract_post_data(self, submission, comment_limit: int, reply_limit: int, content: list):
        """
        Private helper function to extract given a specific post
        """
        try:
            content.append("-------- POST TITLE ---------")  
            content.append(submission.title)
            content.append(f"Post Date: {(datetime.fromtimestamp(submission.created_utc, timezone.utc)).strftime('%Y-%m-%d %H:%M:%S %Z')}")

            content.append("-------- START OF POST CONTENT ---------")
            content.append(submission.selftext)
            if not submission.is_self:
                content.append(f"Post is a link: {submission.url}")

            submission.comment_sort = "top"
            parent_comment_count = 0
            await submission.load()
            
            async for parent_comment in submission.comments:
                content.append("-------- TOP COMMENT ---------")
                if isinstance(parent_comment, MoreComments):
                    continue

                if parent_comment.author is None:
                    continue
                
                if parent_comment.body.strip().startswith('!'):
                    continue

                author_name = parent_comment.author.name.lower()
                if author_name == 'automoderator' or author_name.endswith('bot'):
                    continue

                comment_date = datetime.fromtimestamp(parent_comment.created_utc, timezone.utc).strftime('%Y-%m-%d')
                content.append(f"[Author: u/{parent_comment.author.name} | Date: {comment_date}]")
                content.append(parent_comment.body)
                parent_comment_count += 1

                reply_count = 0
                content.append("-------- TOP REPLIES FROM THE COMMENT ---------")
                
                async for reply in parent_comment.replies:
                    if isinstance(reply, MoreComments):
                        continue

                    content.append(reply.body)
                    reply_count += 1

                    if reply_count >= reply_limit:
                        break
                        
                if parent_comment_count >= comment_limit:
                    break

        except Exception as e:
            print(f"Error extracting post data: {e}")
            return None
        
    async def get_content_by_query(self, query: str, subreddit: str = "all", post_limit: int = 5, comment_limit: int = 5, reply_limit: int = 5, sources: Set = None) -> str:
        """
        Crawls reddit using asyncpraw based on a search query.
        """
        content = []
        
        async with asyncpraw.Reddit(
            client_id=self.client_id,
            client_secret=self.client_secret,
            user_agent=self.user_agent
        ) as reddit:
            try:
                subreddit_client = await reddit.subreddit(subreddit)
                
                async for submission in subreddit_client.search(query, limit=post_limit):
                    if sources is not None:
                        snippet = (submission.selftext or "").strip()[:350]
                        sources.add((submission.title, f"https://www.reddit.com{submission.permalink}", snippet))
 
                    await self._extract_post_data(
                        submission=submission, 
                        comment_limit=comment_limit, 
                        reply_limit=reply_limit, 
                        content=content
                    )
            except Exception as e:
                print(f"Error during Reddit query search: {e}")
                raise e

        return "\n".join(content)

    async def get_content_by_url(self, url: str = "", comment_limit: int = 5, reply_limit: int = 5, sources: Set = None) -> str:
        """
        Crawls reddit using asyncpraw based on a provided url. Compiles and returns the following information:
        - Post Title
        - Post Date
        - Post Content
        - Hot Comments
        - Replies to the comments

        Args:
            url: the direct link to the post
            comment_limit: the number of comments to print
            reply_limit: the number of replies to each comment to print
            sources: (Optional) A set to add the (title, url) tuple to.

        Returns:
            String containing the relevenant information
        """
        if not url:
            return ""
        
        content = []

        async with asyncpraw.Reddit(
            client_id=self.client_id,
            client_secret=self.client_secret,
            user_agent=self.user_agent
        ) as reddit:
            try:
                submission = await reddit.submission(url=url)
                await submission.load() 

                if sources is not None:
                    snippet = (submission.selftext or "").strip()[:350]
                    sources.add((submission.title, f"https://www.reddit.com{submission.permalink}", snippet))

                await self._extract_post_data(
                    submission=submission, 
                    comment_limit=comment_limit, 
                    reply_limit=reply_limit, 
                    content=content
                )
            
            except Exception as e:
                print(f"Error during Reddit URL fetch/extraction: {e}")
                raise e

        return "\n".join(content)

client = RedditClient()