[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [String]
    $ConnectURL,
    [Parameter(Mandatory=$true)]
    [String]
    $ImportToken,
    [Parameter(Mandatory=$true)]
    [String]
    $SIMSUser,
    [Parameter(Mandatory=$true)]
    [String]
    $SIMSPassword
)

& 'C:\Program Files (x86)\SIMS\SIMS .net\CommandReporter.exe' /USER:"$SIMSUser" /PASSWORD:"$SIMSPassword" /REPORT:"Connect Staff" /OUTPUT:"$env:TEMP\staff-code.xml"
& 'C:\Program Files (x86)\SIMS\SIMS .net\CommandReporter.exe' /USER:"$SIMSUser" /PASSWORD:"$SIMSPassword" /REPORT:"Connect Students" /OUTPUT:"$env:TEMP\students.xml"
& 'C:\Program Files (x86)\SIMS\SIMS .net\CommandReporter.exe' /USER:"$SIMSUser" /PASSWORD:"$SIMSPassword" /REPORT:"Connect Timetables" /OUTPUT:"$env:TEMP\timetables.xml"

$staffCodes = Get-Content "$env:TEMP\staff-code.xml"
$students = Get-Content "$env:TEMP\students.xml"
$timetables = Get-Content "$env:TEMP\timetables.xml"

function Export-ToConnect($body, $url){
  $encodedContent = [System.Text.Encoding]::UTF8.GetBytes($body)

  $webRequest = [System.Net.WebRequest]::Create($url)

  $webRequest.Method = "Post"
  $webRequest.ContentType = "text/xml"
  $webRequest.ContentLength = $encodedContent.length
  $webRequest.Headers.Add('Import-Token', $ImportToken)

  $requestStream = $webRequest.GetRequestStream()
  $requestStream.Write($encodedContent, 0, $encodedContent.length)
  $requestStream.Close()
}

Export-ToConnect -body $staffCodes -url "$ConnectURL/import/staff"
Export-ToConnect -body $students -url "$ConnectURL/import/students"
Export-ToConnect -body $timetables -url "$ConnectURL/import/timetables"
