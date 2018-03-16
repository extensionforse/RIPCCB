$(document).ready(function () {

    chrome.storage.sync.get('user_info', function (res) {

        $('#full_name').val(res.user_info[0].full_name);
        $('#address').val(res.user_info[0].address);
        $('#city').val(res.user_info[0].city);
        $('#state').val(res.user_info[0].state);
        $('#zip').val(res.user_info[0].zip);
        $('#email').val(res.user_info[0].email);
        $('#business_name').val(res.user_info[0].business_name);

    });
    $('#user_info').submit(function () {
        chrome.storage.sync.set({
            'user_info': [
                {
                    full_name: $('#full_name').val(),
                    address: $('#address').val(),
                    city: $('#city').val(),
                    state: $('#state').val(),
                    zip: $('#zip').val(),
                    email: $('#email').val(),
                    business_name: $('#business_name').val()
                }
            ]
        }, function() {

        });
    });


    function initFS(grantedBytes) {
            window.requestFileSystem(window.PERSISTENT, grantedBytes, function(fs) {




                setTimeout(function () {

                    $('.rw').click( function (e) {

                        var filename = $(this).find('div:first-child').text();

                        readReport(filename);




                    });

                }, 1300);



                // Read file
                function readReport(fileName) {
                    fs.root.getFile(fileName, {}, function(fileEntry) {


                        fileEntry.file(function(file) {
                            var reader = new FileReader();

                            reader.onloadend = function(e) {


                                var text = this.result;
                                var filename = fileName;
                                var blob = new Blob([text], {type: "text/html;charset=utf-8"});
                                saveAs(blob, filename);
                            };

                            reader.readAsText(file);
                        }, errorHandler);

                    }, errorHandler);
                }

                // List all
                function listAll() {
                    var dirReader = fs.root.createReader();
                    dirReader.readEntries(function(entries) {

                        $('.table').html('');

                        for (var i = 0, entry; entry = entries[i]; ++i) {

                            $('.table').append('<div class="rw" id="file_' + i +'">' +
                                '<div class="cl">' + entry.name + '</div>' +
                                '<div class="cl save_report">Save to Folder</div>'
                            );


                        }

                        if(  $('.table').find('div').length == 0 ){
                            $('#remove_reports, h2').hide()
                        } else {
                            $('#remove_reports, h2').show()
                        }

                    }, errorHandler);
                }

                // Remove all
                function removeAll() {
                    var dirReader2 = fs.root.createReader();
                    dirReader2.readEntries(function(entries) {
                        for (var i = 0; i < entries.length; i++) {

                            // Removing Directory
                            if (entries[i].isDirectory) {
                                entries[i].removeRecursively(function() {}, errorHandler);
                            }
                            // Removing File
                            else {
                                entries[i].remove(function() {}, errorHandler);
                            }
                        }
                        checkReports();
                    }, errorHandler);
                }

                $('#remove_reports').click(function () {
                    removeAll();
                });

                //createReport();

                listAll();
                //removeAll();

            }, errorHandler);
        }
    function errorHandler(e) {
            return true;
        }
    function checkReports() {



        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;


        navigator.webkitPersistentStorage.requestQuota (
            1024*1024, function(grantedBytes) {

                initFS(grantedBytes);

            }, function(e) { console.log('Error', e); }
        );



        }
    chrome.storage.onChanged.addListener(function (changes, areaName) {

        setTimeout(checkReports, 1300)
    });

    checkReports();

});
