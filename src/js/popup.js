// Getting Current Page URL and Passing it to an Input Field;
chrome.tabs.query({active: true}, function (tab) {
    $('#infringing_work').val( tab[0].url );
    var url = new URL(tab[0].url);
    $('.footerLine').text('Reporting: ' + url.host);


});


// Handling Checkboxes:
$('#yes, #no').click(function() {
    checkCheckboxes(this);

});


function checkCheckboxes(obj) {
    if( typeof obj == 'undefined') obj = $('input[type=checkbox]');
    if ($(obj).is(':checked')) {

        switch ($(obj).attr('id')){
            case 'yes':
                $('#no').attr('checked', false);
                $('#popup_add_to_report').show();
                $('#popup_submit').hide();
                $('#popup_add_to_report').attr('disabled', false);




                break;
            case 'no':
                $('#yes').attr('checked', false);
                $('#popup_add_to_report').hide();
                $('#popup_submit').show();
                $('#popup_submit').attr('disabled', false);
                break;
        }

    } else {
        $('#popup_add_to_report').attr('disabled', true);
        $('#popup_submit').attr('disabled', true);
    }
}




function addToReport(domainName, originalWork, infringingWork, generate) {



    domainName = domainName.hostname;

    chrome.storage.sync.get({reports:[]}, function(data){



        data.reports.push( domainName + '|' + originalWork + '|' + infringingWork );
        reportHandler( data.reports, generate );
    });



}


function reportHandler(reports, generate) {

    var generate = generate;
    if(typeof generate == 'undefined'){
        var generate = {status: false};
    }



    chrome.storage.sync.set({reports: reports}, function(){



        if( generate.status ){


            generateTotalReport(generate.domainName.host);
        }
    });
}

function generateTotalReport(domainName) {
    chrome.storage.sync.get({reports:[]}, function(data){


        var totalReport = {
            domainName: '',
            infringingWorks: [],
            originalWorks: []
        };

        for(var i in data.reports){
            if( domainName ==  data.reports[i].split('|')[0] ){
                totalReport.domainName = domainName;
                totalReport.infringingWorks.push( data.reports[i].split('|')[1] );
                totalReport.originalWorks.push( data.reports[i].split('|')[2] );
            }

        }


        chrome.runtime.sendMessage({totalReport: totalReport}, function (res) {});




    } );
}





// Add to Report
$('#popup_add_to_report').click(function (){

    var originalWork = $('#original_work').val(),
        infringingWork = $('#infringing_work').val(),
        domainName;

    if( (typeof originalWork != 'undefined' && originalWork != '') && (typeof infringingWork != 'undefined' && infringingWork != '') ){
        domainName = (new URL( infringingWork ));
        $('#original_work').val('');
        addToReport( domainName, originalWork, infringingWork );
    }


});

// Generate Total Report
$('#popup_submit').click(function () {

    var originalWork = $('#original_work').val(),
        infringingWork = $('#infringing_work').val(),
        domainName;

    if( (typeof originalWork != 'undefined' && originalWork != '') && (typeof infringingWork != 'undefined' && infringingWork != '') ){
        domainName = (new URL( infringingWork ));
        $('#original_work').val('');


        addToReport(domainName, originalWork, infringingWork, {status: true, domainName: domainName});





    }


});

















































