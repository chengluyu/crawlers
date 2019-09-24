import requests
import time
import json
from datetime import datetime
import colorama
from colorama import Fore

colorama.init()

def fetch_comments(article_id: int, user_id: int):
    url = 'https://sspai.com/api/v1/comment/user/article/hot/page/get'
    params = {'limit': 10, 'offset': 0, 'article_id': article_id, 'user_id': user_id}
    comments = []
    while True:
        result = requests.get(url, params)
        content = result.json()
        if content['error'] == 0:
            comments += content['data']
            if len(content['data']) < params['limit']:
                break
            params['offset'] += len(content['data'])
        else:
            print(f'Replied with error code {content["error"]}')
        time.sleep(3)
    return comments


def fetch_articles():
    url = 'https://sspai.com/api/v1/articles'
    params = {'offset': 0, 'limit': 10}
    while True:
        result = requests.get(url, params)
        content = result.json()
        if isinstance(content['list'], list):
            params['offset'] += len(content['list'])
            yield content['list']
            if len(content['list']) < params['limit']:
                break
        else:
            print(f'Replied nothing')

def main():
    for index, batch in enumerate(fetch_articles()):
        for item in batch:
            item_id, item_title = item['id'], item['title']

            dt = datetime.fromtimestamp(item['released_at'])
            # What I can remember is that that post is published after August.
            if dt.month < 8:
                return

            json.dump(item, open(f'articles/{item_id}.metadata.json', 'w'))
            print(f'[{Fore.GREEN}{dt.strftime("%Y/%m/%d")}{Fore.RESET}] [{Fore.RED}{item_id}{Fore.RESET}] "{item_title}"')

            comments = fetch_comments(item_id, 722568)
            json.dump(comments, open(f'articles/{item_id}.comments.json', 'w'))
            print(f'{len(comments)} comment(s) were fetched')
        time.sleep(5)


if __name__ == "__main__":
    main()
