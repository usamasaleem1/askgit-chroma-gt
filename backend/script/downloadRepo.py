import os
from shutil import rmtree
from pathlib import Path
from subprocess import run
from git import Repo
import shutil
import requests
import json

def download_directory(github_url=None):
    if github_url is None:
        repo_url = input("Enter the repository url: ")
    else:
        repo_url = github_url
        repoAuthor = repo_url.split('/')[3]
        repoName = repo_url.split('/')[4]
        print(f"Repo Author: {repoAuthor}")
        print(f"Repo Name: {repoName}")
        author_repoName = repoAuthor + "_" + repoName
    repo_url = repo_url if repo_url.endswith('.git') else repo_url + '.git'
    target_path = "RepoContents"
    # delete RepoContents folder if it exists
    if os.path.exists(target_path):
        rmtree(target_path)
    # delete data_backup folder if it exists
    data_backup_path = repo_url.split('/')[4]
    if os.path.exists(data_backup_path):
        rmtree(data_backup_path)
    print(f"Cloning {repo_url} to {target_path}...")
    # time taken to clone the repo
    import time
    start_time = time.time()
    repo = Repo.clone_from(repo_url, target_path, depth=1)
    end_time = time.time()
    
    print(f"SUCCESS: Cloned {repo_url} to {target_path}")
    repo.git.pull()
    print(f"SUCCESS: Pulled {repo_url} to {target_path}")

    # for each file in RepoContents, copy it to data_backup if the file is readable as a text file, and convert it to a .txt file in the data_backup folder
    for root, path, files in os.walk(target_path):
        for file in files:
            file_path = os.path.join(root, file)
            if os.path.isfile(file_path):
                if file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                    continue
                elif is_text_file(file_path):
                    print(f"Copying {file_path} to {data_backup_path}")
                    os.makedirs(data_backup_path, exist_ok=True)
                    shutil.copy(file_path, data_backup_path)
                    print(f"SUCCESS: Copied {file_path} to {data_backup_path}")

                    print(f"Converting {file_path} to {data_backup_path}")

                    text_file_name = file_path + '.txt'
                    text_file_name = text_file_name.replace('RepoContents/', '')

                    safe_file_name = text_file_name.replace('/', '_')
                    output_file_path = os.path.join(
                        data_backup_path, safe_file_name)

                    with open(output_file_path, 'w', encoding='utf-8') as f:
                        with open(file_path, 'r', encoding='utf-8') as original_file:
                            f.write(original_file.read())

                    print(
                        f"SUCCESS: Converted {file_path} to {data_backup_path}")

                    # Remove the original file from the data_backup folder
                    os.remove(os.path.join(data_backup_path, file))
                    print(
                        f"SUCCESS: Removed original file {file} from {data_backup_path}")
    print(f"\nTime taken to clone: {end_time - start_time} seconds")
    
def download_metadata(github_url):
    
    def save_to_file(data, filename):
        metadata_db_path = "metadata-db"
        os.makedirs(metadata_db_path, exist_ok=True)
        full_path = os.path.join(metadata_db_path, filename)
        with open(full_path, 'w') as f:
            json.dump(data, f, indent=4)                
    # Headers including the personal access token for GitHub API
    headers = {'Authorization': 'token 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'}
    
    # Base URL for the GitHub API request using variables
    AUTHOR = github_url.split('/')[3]
    REPONAME =  github_url.split('/')[4]
    url = f'https://api.github.com/repos/{AUTHOR}/{REPONAME.replace(".git", "")}'

    # Make the initial API request to get the repository data
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        repo_data = response.json()

        # Extract URLs for issues, pull requests, and branches
        issues_url = repo_data['issues_url'].split('{')[0]+"?per_page=100"
        pulls_url = repo_data['pulls_url'].split('{')[0]+"?per_page=100"
        branches_url = repo_data['branches_url'].split('{')[0]+"?per_page=100"

        # Make API requests for issues, pull requests, and branches
        issues_response = requests.get(issues_url, headers=headers)
        pulls_response = requests.get(pulls_url, headers=headers)
        branches_response = requests.get(branches_url, headers=headers)

        # Check if all requests were successful
        if issues_response.status_code == 200 and pulls_response.status_code == 200 and branches_response.status_code == 200:
            # Parse the responses
            issues_data = issues_response.json()
            # Parse only the required information from the issues data
            issues_data = [{
                                'issue_number': issue['number'],
                                'title': issue['title'],
                                'opened_by': issue['user']['login'],
                                'labels': [{
                                            'name': label['name'],
                                            'url': label['url'],
                                            'description': label.get('description', '')} for label in issue['labels']],
                                'state': issue['state'],
                                'created_at': issue['created_at'],
                                'updated_at': issue['updated_at'],
                                'closed_at': issue['closed_at']} for issue in issues_data]
            pulls_data = pulls_response.json()
            pulls_data = [{'url': pr['url'],
                                'id': pr['id'],
                                'state': pr['state'],
                                'title': pr['title'],
                                'user_login': pr['user']['login'],
                                'body': pr['body'],
                                'created_at': pr['created_at'],
                                'updated_at': pr['updated_at'],
                                'closed_at': pr['closed_at'],
                                'merged_at': pr['merged_at'],
                                'merge_commit_sha': pr['merge_commit_sha'],
                                'labels': [label['name'] for label in pr['labels']] if 'labels' in pr else []} for pr in pulls_data]
            
            branches_data = branches_response.json()
            branches_data = [{'name': branch['name'], 'commit': branch['commit']} for branch in branches_data]
            repo_data = {
                'author': repo_data['full_name'],
                'owner_login': repo_data['owner']['login'],
                'description': repo_data['description'],
                'forks_count': repo_data['forks_count'],
                'open_issues_count': repo_data['open_issues_count'],
                'watchers': repo_data['watchers_count'],
                'last_updated': repo_data['pushed_at'],
            }
            # Combine all data into one dictionary
            all_metadata = {
                'repository': repo_data,
                'issues': issues_data,
                'pull_requests': pulls_data,
                'branches': branches_data
            }
            RepoName_Author = REPONAME + "_" + AUTHOR
            # Save the combined data to a JSON file in the current directory
            # Save repository, issues, pull requests, and branches as separate files
            # save_to_file(repo_data, f'{REPONAME}-{AUTHOR}_REPOSITORY.json')
            # save_to_file(issues_data, f'{REPONAME}-{AUTHOR}_ISSUES.json')
            # save_to_file(pulls_data, f'{REPONAME}-{AUTHOR}_PULL_REQUESTS.json')
            # save_to_file(branches_data, f'{REPONAME}-{AUTHOR}_BRANCHES.json')
            save_to_file(all_metadata, f'{REPONAME.replace(".git", "")}.json')
            print("All metadata saved")
            
        else:
            # Handle errors for the individual requests
            if issues_response.status_code != 200:
                print(f"Error fetching issues: {issues_response.status_code} - {issues_response.text}")
            if pulls_response.status_code != 200:
                print(f"Error fetching pull requests: {pulls_response.status_code} - {pulls_response.text}")
            if branches_response.status_code != 200:
                print(f"Error fetching branches: {branches_response.status_code} - {branches_response.text}")
    else:
        print(f"Error fetching repository data: {response.status_code} - {response.text} for {url}")

def is_text_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            # Try reading a small chunk to check if it's a text file
            file.read(100)
        return True
    except UnicodeDecodeError:
        # Raised when the file is not a text file
        return False
    except Exception as e:
        # Handle other exceptions as needed
        print(f"Error: {e}")
        return False

# download_directory()

