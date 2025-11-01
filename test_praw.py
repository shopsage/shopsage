import praw
from praw.models import MoreComments
import os
import dotenv
from datetime import datetime, timezone

# use asyncpraw for async features
def main(query: str, subreddit: str = "all", post_limit: int = 5, comment_limit: int = 5, reply_limit: int = 5):
    """
    Crawls reddit using praw. Prints out these relevant information based off the argument specifications below:
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
        None
    """
    reddit = praw.Reddit(
        client_id=os.getenv("REDDIT_CLIENT_ID"),
        client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
        user_agent="My Public Data Service v1.0 by u/YourUsername"
    )

    try:
        subreddit = reddit.subreddit(subreddit)
    
        for submission in subreddit.search(query, limit=post_limit):
            print("-------- POST TITLE ---------") 
            print(submission.title)
            print(f"Post Date: {(datetime.fromtimestamp(submission.created_utc, timezone.utc)).strftime("%Y-%m-%d %H:%M:%S %Z")}")

            print("-------- START OF POST CONTENT ---------")
            print(submission.selftext)

            submission.comment_sort = "top"
            parent_comment_count = 0
    
            for parent_comment in submission.comments:
                print("-------- TOP COMMENT ---------")
                if isinstance(parent_comment, MoreComments):
                    continue
                if parent_comment.author is None:
                    continue
        
                if parent_comment.body.strip().startswith('!'):
                    continue

                author_name = parent_comment.author.name.lower()
                if author_name == 'automoderator' or author_name.endswith('bot'):
                    continue
                
                print(parent_comment.body)
                parent_comment_count += 1

                reply_count = 0
                print("-------- TOP REPLIES FROM THE COMMENT ---------")
                for reply in parent_comment.replies:
                    if isinstance(reply, MoreComments):
                        continue

                    print(reply.body)
                    reply_count += 1

                    if reply_count >= reply_limit:
                        break
                    
                if parent_comment_count >= comment_limit:
                    break
                    

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    dotenv.load_dotenv()
    # LLM needs to be able to produce a reddit search optimised query for user question
    # self:yes returns posts that are actually text posts rather than url redirections. this optmisation should be done by the LLM
    query = "headphones under $300 with ANC self:yes"
    # consider using LLM internal knowledge to providde the relevant subreddit to search for. the all serach can be done in google wide search
    subreddit = "all"
    post_limit = 1
    main(query=query, subreddit=subreddit, post_limit=post_limit)