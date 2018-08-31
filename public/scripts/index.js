// index.js

var REST_DATA = 'api/favorites';
var KEY_ENTER = 13;
var defaultItems = [

];

function encodeUriAndQuotes(untrustedStr) {
    return encodeURI(String(untrustedStr)).replace(/'/g, '%27').replace(')', '%29');
}

function loadItems() {
    var table = document.getElementById('notes');
    while(table.rows.length > 0) {
      table.deleteRow(0);
    }
    showLoadingMessage();
    var topic = document.getElementById('searchFilter').value;

    xhrGet(REST_DATA+"?topic="+topic, function(data) {

        var newRow = document.createElement('tr');
        newRow.innerHTML="<td width=80%><div class='contentHeader'>Title</div></td>";
        document.getElementById('notes').lastChild.appendChild(newRow);

        //stop showing loading message
        stopLoadingMessage();

        var receivedItems = data || [];
        var items = [];
        var i;
        // Make sure the received items have correct format
        for (i = 0; i < receivedItems.length; ++i) {
            var item = receivedItems[i];
            if (item && 'id' in item) {
                items.push(item);
            }
        }
        items.sort(function(a, b){
          return b.final_score-a.final_score
        });

        var hasItems = items.length;
        if (!hasItems) {
            items = defaultItems;
        }
        for (i = 0; i < items.length; ++i) {
            addItem(items[i], !hasItems, i%2);
        }
        if (!hasItems) {
            var table = document.getElementById('notes');
            var nodes = [];
            for (i = 0; i < table.rows.length; ++i) {
                nodes.push(table.rows[i].firstChild.firstChild);
            }

            function save() {
                if (nodes.length) {
                    saveChange(nodes.shift(), save);
                }
            }
            save();
        }
    }, function(err) {
        console.error(err);
    });
}

function startProgressIndicator(row) {
    row.innerHTML = "<td class='content'>Uploading file... <img height=\"50\" width=\"50\" src=\"images/loading.gif\"></img></td>";
}

function removeProgressIndicator(row) {
    row.innerHTML = "<td class='content'>uploaded...</td>";
}

function addNewRow(table) {
    var newRow = document.createElement('tr');
    table.appendChild(newRow);
    return table.lastChild;
}


function setRowContent(item, row, rowflag) {


    var innerHTML = "<td><div class='contentTiles'>" + item.name + "</div></td>";
    row.innerHTML = innerHTML;

}

function addItem(item, isNew, flag) {

    var row = document.createElement('tr');
    row.className = "tableRows"+flag;

    if (item) // if not a new row
    {
        setRowContent(item, row);
    }

    var table = document.getElementById('notes');
    table.lastChild.appendChild(row);
    row.isNew = !item || isNew;

    if (row.isNew) {
        var textarea = row.firstChild.firstChild;
        textarea.focus();
    }

}


function saveChange(contentNode, callback) {
    var row = contentNode.parentNode.parentNode;

    var data = {
        name: row.firstChild.firstChild.value,
        value: row.firstChild.nextSibling.firstChild.value
    };

    if (row.isNew) {
        delete row.isNew;
        xhrPost(REST_DATA, data, function(item) {
            row.setAttribute('data-id', item.id);
            callback && callback();
        }, function(err) {
            console.error(err);
        });
    } else {
        data.id = row.getAttribute('data-id');
        xhrPut(REST_DATA, data, function() {
            console.log('updated: ', data);
        }, function(err) {
            console.error(err);
        });
    }
}

function toggleServiceInfo() {
    var node = document.getElementById('vcapservices');
    node.style.display = node.style.display == 'none' ? '' : 'none';
}

function toggleAppInfo() {
    var node = document.getElementById('appinfo');
    node.style.display = node.style.display == 'none' ? '' : 'none';
}


function showLoadingMessage() {
    document.getElementById('loadingImage').style.display = '';
    document.getElementById('loadingImage').innerHTML = "Loading data " + "<img height=\"100\" width=\"100\" src=\"images/loading.gif\"></img>";
}

function stopLoadingMessage() {
    document.getElementById('loadingImage').innerHTML = "";
}

var input = document.getElementById("searchFilter");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Cancel the default action, if needed
  event.preventDefault();
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Trigger the button element with a click
    document.getElementById("btnSearch").click();
  }
});


function showDetails(detailsId)
{
  document.getElementById('myModal').style.display = "block";
  document.getElementById("detailContent").innerHTML = document.getElementById(detailsId).innerHTML
}

// When the user clicks on <span> (x), close the modal
function closeModelDialog() {
    document.getElementById('myModal').style.display = "none";
    document.getElementById("detailContent").innerHTML = "";
}
