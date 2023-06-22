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
& 'C:\Program Files (x86)\SIMS\SIMS .net\CommandReporter.exe' /USER:"$SIMSUser" /PASSWORD:"$SIMSPassword" /REPORT:"Connect Classes" /OUTPUT:"$env:TEMP\classes.xml"

$staffCodes = [xml](Get-Content -Path "$env:TEMP\staff-code.xml")
$students = [xml](Get-Content -Path "$env:TEMP\students.xml")
$classes = [xml](Get-Content -Path "$env:TEMP\classes.xml")

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

$staffData = @()

$staffCodes.SuperStarReport.Record | ForEach {
  $staffData += @{
    name = $_.Title + " " + $_.Preferred_x0020_Surname;
    username = $_.Staff_x0020_Code.ToLower();
  }
}

$staffJson = ConvertTo-JSON $staffData -Compress

Export-ToConnect -body $staffJson -url "$ConnectURL/import/staff"

$studentData = @()

$students.SuperStarReport.Record | ForEach {
  $studentData += @{
    name = $_.Forename + " " + $_.Surname;
    username = ($_.Primary_x0020_Email -Split "@")[0].ToLower();
    upn = $_.UPN;
    yearGroup = ($_.Year -Replace "  ", " ");
    regGroup = $_.Reg;
  }
}

$studentJSON = ConvertTo-JSON $studentData -Compress

Export-ToConnect -body $studentJSON -url "$ConnectURL/import/students"

$classData = New-Object pscustomobject

$classes.SuperStarReport.Record | ForEach {
  $className = $_.Class

  if($_.Work_x0020_Email -eq $null){
    return
  }

  if(!$classData.$className){
    $classData | Add-Member -NotePropertyName $className -NotePropertyValue @{
      name = $_.Class
      teacherUsername = ($_.Work_x0020_Email -Split "@")[0].ToLower()
      students = New-Object System.Collections.Generic.List[System.Object]
    }
  }

  $classData.$className.students.Add($_.UPN)
}

$classJSON = ConvertTo-JSON $classData -Compress

Export-ToConnect -body $classJSON -url "$ConnectURL/import/classes"
