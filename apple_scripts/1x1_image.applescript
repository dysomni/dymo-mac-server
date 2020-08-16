(*
Add comment
*)


on run argv
	set label_path to item 1 of argv as text
	set qr_path to item 2 of argv as text
	
	tell application "DYMO Label"
		
		openLabel in label_path
		redrawLabel
		
		set img to a reference to first item of print objects
		tell img
			set imageFileName to qr_path
		end tell
		
		redrawLabel
		printLabel
		
	end tell
	return argv
end run