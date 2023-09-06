<script>
    function printPattern(luckyNumber) {
        const mid = Math.ceil(luckyNumber / 2);
        const skipOddNumber = (luckyNumber % 2) == 0 ? 1 : 2;
        let charCode = 65; // ASCII code for 'A'

        let main_row = "*";
        for (let i = 1; i <= luckyNumber; i++) {
            let row = '';

            // Handle spaces before numbers
            for (let space = 1; space <= mid - i + (luckyNumber - mid + 1); space++) {
                row += '  ';
            }

            // Handle odd numbers
            for (let num = 1; num <= i * 2; num += 2) {
                row += num + ' ';
            }

            // Handle letters
            for (let letter = 1; letter <= i - 1; letter++) {
                let newCharCode = (letter - 1) + charCode;
                // Reset the letter code if it exceeds 'Z'
                if (newCharCode > 90) {
                    newCharCode = newCharCode - 26; // Reset to 'A'
                }
                row += String.fromCharCode(newCharCode) + ' ';
            }


            console.log(row);
            main_row += `<pre>${row}</pre>`;
        }

        for (let i = mid + (mid - skipOddNumber); i >= 1; i--) {
            let row = '';

            // Handle spaces before numbers
            for (let space = 1; space <= mid - i + (luckyNumber - mid + 1); space++) {
                row += '  ';
            }

            // Handle odd numbers
            for (let num = 1; num <= i * 2; num += 2) {
                row += num + ' ';
            }

            // Handle letters
            for (let letter = 1; letter <= i - 1; letter++) {
                let newCharCode = (letter - 1) + charCode;
                // Reset the letter code if it exceeds 'Z'
                if (newCharCode > 90) {
                    newCharCode = newCharCode - 26; // Reset to 'A'
                }
                row += String.fromCharCode(newCharCode) + ' ';
            }

            console.log(row);
            main_row += `<pre>${row}</pre>`;
        }
        document.write(`<pre>Lucky Number:${luckyNumber}</pre>${main_row}`);
    }

    const luckyNumber = parseInt(prompt("Please enter your lucky number greater then 3:"));
    if (!isNaN(luckyNumber)) {
        printPattern(luckyNumber);
    } else {
        console.log("Invalid input. Please enter a number.");
    }
</script>