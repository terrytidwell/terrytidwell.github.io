param (
    [string]$FileName = "fsm",
    [string]$GameName = "fall-spring-mattress"
)

# Set the PATH environment variable temporarily
$env:Path += ";C:\Users\vtidw\Documents\butler"
butler push --verbose "$FileName" cricketHunter/"$GameName":html5