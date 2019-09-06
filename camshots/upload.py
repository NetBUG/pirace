import requests
# import api from vk
import tempfile

group_id = 'group_123'

# See https://vk.com/dev/upload_files?f=2.%20Uploading%20Photos%20on%20User%20Wall
def uploadPhoto(filename, text):
        r1 = api.photos_getWallUploadServer(owner_id=group_id)

        # 2. upload
        with open(filename, 'rb') as f:
            r2 = requests.post(r1['upload_url'], files={'photo': f})
        r2 = json_decoder.decode(r2.text)
        print (r2['photo'])
        
        # 3. save
        r3 = api.photos_saveWallPhoto(server=r2['server'], photo=r2['photo'], hash=r2['hash'], caption=text)
        print (r3)

def uploadVideo(filename):
    # See https://vk.com/dev/upload_files_2?f=9.%2BUploading%2BVideo%2BFiles

def makePhoto(filename):
    pass

def makeVideo(filename):
    pass

if __name__ == '__main__':
  temp_name = next(tempfile._get_candidate_names())
  