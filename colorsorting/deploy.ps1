param (
    [string]$FileName = "colorsorting",
    [string]$GameName = "hue-shift",
    [string]$UserName = "cricketHunter"
)

# Set the PATH environment variable temporarily
$env:Path += ";C:\Users\vtidw\Documents\butler"
butler push --verbose "$FileName" cricketHunter/"$GameName":html5