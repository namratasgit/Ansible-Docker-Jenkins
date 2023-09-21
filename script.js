function convert() {
    let inputTemp = document.getElementById("inputTemp").value;
    let inputUnit = document.getElementById("inputUnit").value;
    let outputUnit = document.getElementById("outputUnit").value;
    let outputTemp;
    var msgstr;
    if (inputUnit === "celsius" && outputUnit === "fahrenheit") {
        outputTemp = (inputTemp * 9/5) + 32;
        msgstr=inputTemp + " " + inputUnit+ "=" + outputTemp + " " + outputUnit +"\n";
    } else if (inputUnit === "fahrenheit" && outputUnit === "celsius") {
        outputTemp = (inputTemp - 32) * 5/9;
        msgstr=inputTemp + " " + inputUnit+ "=" + outputTemp + " " + outputUnit +"\n";
    } else {
        outputTemp=inputTemp;
       msgstr="Choose a valid unit for coversion";
    }
    alert (msgstr);

    
}