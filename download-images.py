import requests
import json 

def download_file_from_google_drive(id, destination):
    URL = "https://docs.google.com/uc?export=download"

    session = requests.Session()

    response = session.get(URL, params = { 'id' : id }, stream = True)
    token = get_confirm_token(response)

    if token:
        params = { 'id' : id, 'confirm' : token }
        response = session.get(URL, params = params, stream = True)

    save_response_content(response, destination)    

def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            return value

    return None

def save_response_content(response, destination):
    CHUNK_SIZE = 32768

    with open(destination, "wb") as f:
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk: # filter out keep-alive new chunks
                f.write(chunk)

if __name__ == "__main__":
    # file_id = '1En33PhpCjDoxYl0mfFsX_lo4fRv-EwUt'
    # destination = 'img.png'
    # download_file_from_google_drive(file_id, destination)

    # Read data from json file
    with open('data/images.json') as json_file:
        data = json.load(json_file)
        for p in data:
            file_id = p['driveId']
            destination = 'data/img/' + p['fileName']
            download_file_from_google_drive(file_id, destination)
            print('Downloaded: ' + destination)
    
    print('Done!')


