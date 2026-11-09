echo "Python Install"
$userid = Read-Host 'What is your userid?' 
$secStringPassword = Read-Host 'what is your password?' -AsSecureString 
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secStringPassword)) 
py -m pip install --trusted-host nexus-dhs.csda.gov.au --index-url "https://$($userid):$($password)@nexus-dhs.csda.gov.au/repository/pypi-org/simple" -r requirements.txt --target "./libs"
