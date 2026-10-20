# Abre el DOCX generado en Microsoft Word, actualiza índices, numeración de figuras y tablas
# y el campo "Página X de Y" del encabezado, y lo guarda. Opcionalmente exporta un PDF de control.
param([string]$Docx = "$PSScriptRoot\..\LAB04_Plataformas_Emergentes_MatriLab_React_Native.docx", [string]$Pdf = "")
$ruta = (Resolve-Path $Docx).Path
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $doc = $word.Documents.Open($ruta, $false, $false)
  $doc.Fields.Update() | Out-Null
  foreach ($t in $doc.TablesOfContents) { $t.Update() }
  foreach ($t in $doc.TablesOfFigures) { $t.Update() }
  foreach ($s in $doc.Sections) { foreach ($h in $s.Headers) { $h.Range.Fields.Update() | Out-Null } }
  $doc.Save()
  if ($Pdf) { $doc.ExportAsFixedFormat($Pdf, 17) }
  Write-Output "Páginas: $($doc.ComputeStatistics(2))"
  $doc.Close($false)
} finally { $word.Quit() }
