let imageupload = true;
let file;
let results = [];

$(document).ready(function () {

    $("#photo").change(function () {
        file = getNameFromPath($(this).val());
        if (file != null) {
            var extension = file.substr((file.lastIndexOf('.') + 1)).toUpperCase();
            switch (extension) {
                case 'JPG':
                case 'PNG':
                case 'GIF':
                case 'JPEG':
                    flag = true;
                    break;
                default:
                    flag = false;
            }
        }
        if (flag == false) {
           alert("Invalid file type!");
            disablePost();
            return false;
        }
        else {
            var size = GetFileSize(file);
            if (size > 5) {

              alert("File size is too big!");
                disablePost();
            }
            else {
                $("#uploaded").removeClass('d-none');
                $("#imagetest").removeClass('d-none');
                enablePost();
                readURL(this);
             
        
            }
        }

       


    });
    $('#resultstable').DataTable({
        responsive : true,
        columns: [
            { data: "tagId" },
            { data: "probability" },
            { data: "boundingBox.left" },
            { data: "boundingBox.top" },
            { data: "boundingBox.width"},
            { data: "boundingBox.height" }
        ],
        columnDefs: [{
        targets: 6,
            render: function(data, type, row) {
      
            return '<button class="button small stroke uppercase drawrect" type="button"> Draw</button>';
       
        }
    }],
        "fnDrawCallback": function (oSettings, json) {
            drawEvent();
        },
    }) ;
});

function drawEvent() {
    $(".drawrect").off('click');
    $(".drawrect").click(function () {
        var $row = $('#resultstable').DataTable().row($(this).parents('tr'));
        var data = $row.data();
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext("2d");
        var width = canvas.width;
        var height = canvas.height;
        var x = data.boundingBox.left * width;
        var y = data.boundingBox.top * height;
        var rw = data.boundingBox.width * width;
        var rh = data.boundingBox.height * height;
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.rect(x, y, rw, rh);
        ctx.stroke();
    })

}


function disablePost() {

    $('#imageupload').attr('disabled', 'disabled');
}


function enablePost() {

    $('#imageupload').removeAttr('disabled');
  

}


function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            
            //$('#uploaded').attr('src', e.target.result);
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext("2d");
            var image = new Image();
            image.onload = function(){
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image,0,0);
            };
            image.src = e.target.result;
           
        }; 

        reader.readAsDataURL(input.files[0]);
    }
}

function GetFileSize(fileid) {
    var fileSize = 0;   
    var test = $("#photo");
    fileSize = $("#photo")[0].files[0].size; //size in kb
    fileSize = fileSize / 1048576; //size in mb
    return fileSize;
    
}

//get file path from client system
function getNameFromPath(strFilepath) {
    var objRE = new RegExp(/([^\/\\]+)$/);
    var strName = objRE.exec(strFilepath);

    if (strName == null) {
        return null;
    }
    else {
        return strName[0];
    }
}

function processResult(response) {
    
    $('#results').fadeIn();
    var count = response.predictions.length;
    $('#resultcount').text('Craters detected = ' + count);
    $('#resultstable').DataTable().clear();
    $('#resultstable').DataTable().rows.add(response.predictions);
    $('#resultstable').DataTable().draw();
    
    
    
}

function postimage()
{
   
    var file_data = $("#photo").prop('files')[0];
    var form_data = new FormData();
    form_data.append('file', file_data);
    $("#results").removeClass('d-none');
    $.ajax({
        url: 'https://aiplayground2.cognitiveservices.azure.com/customvision/v3.0/Prediction/e3c1b88b-36df-4ad8-85b2-ac9f4e77324d/detect/iterations/Iteration4/image', // point to server-side controller method
        dataType: 'json', // what to expect back from the server
        cache: false,
            headers: {
            "Prediction-Key": "f4742c9d8d2848ea936c66af2d9b3f18"
        },
        contentType: false,
        processData: false,
        data: form_data,
        type: 'post',
        success: function (response) {
            $('#msg').html(response); // display success response from the server
            processResult(response);
            results = response.predictions;
        },
        error: function (response) {
            $('#msg').html(response); // display error response from the server
        }
    });
}

function postimage1()
{
    
    var settings = {
        "url": "https://aiplayground2.cognitiveservices.azure.com/customvision/v3.0/Prediction/e3c1b88b-36df-4ad8-85b2-ac9f4e77324d/detect/iterations/Iteration4/image",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Prediction-Key": "f4742c9d8d2848ea936c66af2d9b3f18",
          "Content-Type": "application/octet-stream"
        },
         "data": $("#photo")[0].files[0]
      };
      
      $.ajax(settings).done(function (response) {
        console.log(response);
      });
}

function drawTop(chosen) 
{
    var filtered =0;
    if (chosen >0) {
        filtered = results.sort((b, a) => parseFloat(a.probability) - parseFloat(b.probability));
        filtered = filtered.slice(0,chosen);
        
    }
    else{
        filtered = results;
    } 
   filtered.forEach((element) => {
       var canvas = document.getElementById('canvas');
       var ctx = canvas.getContext("2d");
       var width = canvas.width;
       var height = canvas.height;
       var x = element.boundingBox.left * width;
       var y = element.boundingBox.top * height;
       var rw = element.boundingBox.width * width;
       var rh = element.boundingBox.height * height;
       ctx.beginPath();
       ctx.strokeStyle = "red";
       ctx.rect(x, y, rw, rh);
       ctx.stroke();
   })
     
            
  
    
}