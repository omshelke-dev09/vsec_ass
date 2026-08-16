function calculate()
{
    var name = document.getElementById("name").value;

    var s1 = Number(document.getElementById("Physics").value);
    var s2 = Number(document.getElementById("Chem").value);
    var s3 = Number(document.getElementById("Maths").value);

    var total = s1 + s2 + s3;
    var percentage = (total / 300) * 100;

    var table = document.getElementById("resultTable");

    var row = table.insertRow(-1);

    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    cell1.innerHTML = name;
    cell2.innerHTML = total + " / 300";
    cell3.innerHTML = percentage.toFixed(2) + "%";

    document.getElementById("name").value = "";
    document.getElementById("Physics").value = "";
    document.getElementById("Chem").value = "";
    document.getElementById("Maths").value = "";
}