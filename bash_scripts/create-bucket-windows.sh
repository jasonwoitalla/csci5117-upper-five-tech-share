#!/bin/bash
./b2-windows.exe authorize-account <your-account-key-id> <your-application-key>

./b2-windows.exe create-bucket --corsRules '[
    {
        "corsRuleName": "downloadFromAnyOriginWithUpload",
        "allowedOrigins": [
            "*"
        ],
        "allowedHeaders": [
            "authorization",
            "content-type",
            "content-length",
            "x-bz-file-name",
            "x-bz-content-sha1"
        ],
        "allowedOperations": [
            "b2_download_file_by_id",
            "b2_download_file_by_name",
            "b2_upload_file",
            "b2_upload_part"
        ],
        "maxAgeSeconds": 3600
    }
]' <your-bucket-name> allPublic
read -p "Press enter to continue"
