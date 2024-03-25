import requests
import json
import os
# Function to save data to a JSON file
import os


data_folder = 'repometadata'

def save_to_file(data, filename):
    full_path = os.path.join(data_folder, filename)
    with open(full_path, 'w') as f:
        json.dump(data, f, indent=4)

# empty the folder
if os.path.exists(data_folder):
    # delete all contents
    for file in os.listdir(data_folder):
        os.remove(os.path.join(data_folder, file))
else:
    # create the folder
    os.makedirs(data_folder)
            
# Headers including the personal access token for GitHub API
headers = {'Authorization': 'token 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'}


# Base URL for the GitHub API request using variables
AUTHOR = 'awaazo'
REPONAME = 'awaazo'
url = f'https://api.github.com/repos/{AUTHOR}/{REPONAME}'

# Make the initial API request to get the repository data
response = requests.get(url, headers=headers)
if response.status_code == 200:
    repo_data = response.json()

    # Extract URLs for issues, pull requests, and branches
    issues_url = repo_data['issues_url'].split('{')[0]
    pulls_url = repo_data['pulls_url'].split('{')[0]
    branches_url = repo_data['branches_url'].split('{')[0]

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

        # Save the combined data to a JSON file in the current directory
        # Save repository, issues, pull requests, and branches as separate files
        save_to_file(repo_data, f'{REPONAME}-{AUTHOR}_REPOSITORY.json')
        save_to_file(issues_data, f'{REPONAME}-{AUTHOR}_ISSUES.json')
        save_to_file(pulls_data, f'{REPONAME}-{AUTHOR}_PULL_REQUESTS.json')
        save_to_file(branches_data, f'{REPONAME}-{AUTHOR}_BRANCHES.json')
        save_to_file(all_metadata, f'{REPONAME}-{AUTHOR}_ALL_METADATA.json')
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
    print(f"Error fetching repository data: {response.status_code} - {response.text}")
