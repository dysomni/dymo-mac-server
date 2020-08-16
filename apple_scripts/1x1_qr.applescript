(*
Add Comment.
*)

on run argv
	set label_path to item 1 of argv as text
	set qr_path to item 2 of argv as text
	set item_id to item 3 of argv as text
	set label to item 4 of argv as text
	
	tell application "DYMO Label"
		
		openLabel in label_path
		redrawLabel
		
		set img to a reference to first item of print objects
		tell img
			set imageFileName to qr_path
		end tell
		
		set txt to a reference to second item of print objects
		tell txt
			set object text to item_id
		end tell
		
		set lbl to a reference to third item of print objects
		tell lbl
			set object text to label
		end tell
		
		redrawLabel
		printLabel
		
	end tell
	return argv
end run