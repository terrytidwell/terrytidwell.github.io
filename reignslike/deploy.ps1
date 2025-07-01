param (
    [string]$FileName = "reignslike",
    [string]$GameName = "reignslike"
)

# Set the PATH environment variable temporarily
$env:Path += ";C:\Users\vtidw\Documents\butler"
butler push --verbose "$FileName" cricketHunter/"$GameName":html5