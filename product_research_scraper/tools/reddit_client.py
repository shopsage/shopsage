import dotenv
import os
import praw
from datetime import datetime, timezone
from praw.models import MoreComments
from typing import Set


dotenv.load_dotenv()

class RedditClient:
    def __init__(self):
        client_id = os.getenv("REDDIT_CLIENT_ID")
        client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    
        if not client_id or not client_secret:
            raise ValueError("REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET must be set")

        self.client = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent="My Public Data Service v1.0"
        )

    def _extract_post_data(self, submission, comment_limit: int, reply_limit: int, content: list):
        """
        Private helper function to extract given a specific post
        """
        try:
            content.append("-------- POST TITLE ---------") 
            content.append(submission.title)
            content.append(f"Post Date: {(datetime.fromtimestamp(submission.created_utc, timezone.utc)).strftime("%Y-%m-%d %H:%M:%S %Z")}")

            content.append("-------- START OF POST CONTENT ---------")
            content.append(submission.selftext)

            submission.comment_sort = "top"
            parent_comment_count = 0
    
            for parent_comment in submission.comments:
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
                
                content.append(parent_comment.body)
                parent_comment_count += 1

                reply_count = 0
                content.append("-------- TOP REPLIES FROM THE COMMENT ---------")
                for reply in parent_comment.replies:
                    if isinstance(reply, MoreComments):
                        continue

                    content.append(reply.body)
                    reply_count += 1

                    if reply_count >= reply_limit:
                        break
                    
                if parent_comment_count >= comment_limit:
                    break

        except Exception as e:
            # skip the current post
            return None
    
    def get_content_by_query(self, query: str, subreddit: str = "all", post_limit: int = 5, comment_limit: int = 5, reply_limit: int = 5, sources: Set = None) -> str:
        """
        Crawls reddit using praw based on a search query. Compiles and returns the following information:
        - Post Title
        - Post Date
        - Post Content
        - Hot Comments
        - Replies to the comments

        Args:
            query: reddit optimised search question
            subreddit: the specfic community to search for the post
            post_limit: the number of posts to search for
            comment_limit: the number of comments to print
            reply_limit: the number of replies to each comment to print

        Returns:
            String containing the relevenant information
        """
        content = []
        try:
            subreddit_client = self.client.subreddit(subreddit)
            for submission in subreddit_client.search(query, limit=post_limit):
                if sources is not None:
                    sources.add((submission.title, submission.url))
                self._extract_post_data(submission=submission, comment_limit=comment_limit, reply_limit=reply_limit, content=content)
        except Exception as e:
            raise e

        return "\n".join(content)

    # can be used with reddit links from google search. needs to be able to handle the case where the post is just a link
    def get_content_by_url(self, url: str = "", comment_limit: int = 5, reply_limit: int = 5):
        """
        Crawls reddit using praw based on a provided url. Compiles and returns the following information:
        - Post Title
        - Post Date
        - Post Content
        - Hot Comments
        - Replies to the comments

        Args:
            url: the direct link to the post
            comment_limit: the number of comments to print
            reply_limit: the number of replies to each comment to print

        Returns:
            String containing the relevenant information
        """
        if not url:
            return None
        raise NotImplementedError

client = RedditClient()