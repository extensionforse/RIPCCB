// Event Listeners:

// Start OnInstalled

//add search value in chrome storage
chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
  sendResponse(message);
  chrome.storage.sync.set({'value': message}, function () {
    //value saved
  });
});

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.tabs.create({url: chrome.extension.getURL('user_info.html'), active: true}, function (tab) {
  });
});


chrome.storage.onChanged.addListener(function (changes, areaName) {
  checkUserInfo();
});


function checkUserInfo() {
  chrome.storage.sync.get({user_info: []}, function (res) {
    if (res.user_info.length > 0) {
      for (var i in Object.keys(res.user_info[0])) {
        if (res.user_info[0][Object.keys(res.user_info[0])[i]] == '' || typeof res.user_info[0][Object.keys(res.user_info[0])[i]] == 'undefined') {
          chrome.browserAction.setPopup({popup: ''});
          return;
        }
      }
      chrome.browserAction.setPopup({popup: 'popup.html'});
    }
  });
}


// Check it
checkUserInfo();

function initFS(grantedBytes, totalReport) {
  window.requestFileSystem(window.PERSISTENT, grantedBytes, function (fs) {
    var reports = totalReport;

    // Creating file
    function createReport(userInfo, reports) {
      var infringingWorks = '',
        originalWorks = '';
      for (var i in reports.infringingWorks) {
        if (reports.infringingWorks.length > 1) {
          infringingWorks += reports.infringingWorks[i] + "<br/>";
        } else {
          infringingWorks += reports.infringingWorks[i]
        }
      }
      for (var k in reports.originalWorks) {

        if (reports.originalWorks.length > 1) {
          originalWorks += reports.originalWorks[k] + "<br/>";
        } else {
          originalWorks += reports.originalWorks[k];
        }
      }
      var canonical_name = reports.domainName;
      // Timestamp:
      var d = new Date;
      var timestamp = normalize(d.getDate());
      timestamp += '-' + normalize(d.getMonth() + 1);
      timestamp += '-' + normalize(d.getFullYear());
      timestamp += '_' + normalize(d.getHours());
      timestamp += ':' + normalize(d.getMinutes());
      timestamp += ':' + normalize(d.getSeconds());

      function normalize(int) {
        return (int < 10 ? '0' + int : int).toString();
      }

      function getInfo(domain) {
        $.post('http://whatismyipaddress.com/hostname-ip', {DOMAINNAME: domain}, function (data) {

          // Split by lines
          var splitByLines = data.split('\n');

          // Loop through
          for (var i in splitByLines) {

            if (splitByLines[i].indexOf('Lookup IPv4 Address:') != -1) {

              $('body').append("<div id='ip'></div>");
              $('#ip').append($.parseHTML(splitByLines[i]));
              getWhoisByIP($('#ip').find('a:first-child').text());
              $('#ip').remove();
            }
          }
        });
      }

      function getWhoisByIP(ip) {
        var infoForExport = {
          netName: '',
          orgAbuseEmail: ''
        };
        var ip = ip;
        $.get('https://www.reg.ru/whois/?dname=' + ip, function (data, status) {
          if (status == 'success') {
            // Split by lines
            var splitByLines = data.split('\n');


            // Loop through
            for (var i in splitByLines) {


              if (splitByLines[i].indexOf('NetName:') != -1) {
                infoForExport.netName = splitByLines[i].split(':')[1].trim();
              }

              if (splitByLines[i].indexOf('OrgAbuseEmail:') != -1) {
                infoForExport.orgAbuseEmail = splitByLines[i].split(':')[1].trim();
              }


            }

            fs.root.getFile('report_' + timestamp + '.rtf', {create: true}, function (fileEntry) {

              fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (e) {
                  chrome.storage.sync.remove('reports', function () {
                    //console.log('Reports Cleared');
                  });
                };
                fileWriter.onerror = function (e) {
                  console.log('Write failed: ' + e.toString());
                };


                var netName = infoForExport.netName;
                var orgAbuseEmail = infoForExport.orgAbuseEmail;


                var text = "<html><head></head>" +
                  "<h3 style='text-align: center'>Notice of unauthorized use of " + userInfo.business_name + " content.</h3>" +
                  "<p>Dear Sir or Madam:</p>" +
                  "<p>I, <b>" + userInfo.full_name + ",</b> am authorized to act as a non-exclusive copyright agent on behalf of <b>" + userInfo.business_name + ".</b> " +
                  "I swear under penalty of perjury that I have detected infringements of <b>" + userInfo.business_name + "</b> copyright " +
                  "interests as detailed in the report below.</p>" +
                  "<p>I have reasonable good faith belief that use of the material in the manner complained of in the report " +
                  "below is not authorized by <b>" + userInfo.business_name + ",</b> my agents, or the law. The information provided herein is " +
                  "accurate to the best of my knowledge. Therefore, this letter is an official notification to effect removal of " +
                  "the detected infringement listed in the report below. The report below specifies the exact location of " +
                  "the infringement. I hereby request that you immediately remove or block access to the infringing " +
                  "material, as specified under Section 512(c) of the Digital Millennium Copyright Act (the 'Act'). Please " +
                  "insure the user refrains from using or sharing with others the unauthorized materials in the future.</p>" +
                  "<p>Please send a prompt response indicating the actions you have taken to resolve this matter. Nothing in " +
                  "this letter shall serve as a waiver of any rights or remedies of <b>" + userInfo.full_name + ",</b> with respect to the alleged " +
                  "infringement, all of which are expressly reserved. If you need to contact me, my contact information is " +
                  "located at the bottom of this letter.</p>" +
                  "<h4>Evidentiary Information: </h4>" +
                  "Infringed Work(s):<br />" + infringingWorks + "<br />" +
                  "Infringing URL(s): <br />" + originalWorks + "<br />" +
                  "<h4>Explanation:</h4>" +
                  "<p>It has been brought to our attention that unlawful copies of our custom designs have been offered for sale by an unauthorized vendor on <b>" + canonical_name + ".</b> This site is hosted on <b>" + netName + "</b></p>" +
                  "<p>This infringes upon our own exclusive copyrights to the design on this product. Under US copyright law, " +
                  "the referenced copyright design belongs to <b>" + userInfo.full_name + ".</b> It is requested that you cease and desist this " +
                  "copyright infringement. </p>" +
                  "Regards, <br/>" +
                  userInfo.business_name + "<br/>" +
                  userInfo.full_name + "<br/>" +
                  "Email: " + userInfo.email + "<br/>" +
                  "Date Posted: " + (new Date()) + "<br/>" +
                  "Send to: " + orgAbuseEmail +
                  "</body></html>";


                //console.log(text);

                // Create a new Blob and write it to report
                var blob = new Blob([text], {type: 'text/plain'});
                fileWriter.write(blob);


              }, errorHandler);

            }, errorHandler);
          } else {
            getWhoisByIP(ip);
          }


        });
      }

      getInfo(reports.domainName);


    }

    // Read file
    function readReport(name) {
      fs.root.getFile(name, {}, function (fileEntry) {

        // Get a File object representing the file,
        // then use FileReader to read its contents.
        fileEntry.file(function (file) {
          var reader = new FileReader();

          reader.onloadend = function (e) {
            console.log(this.result)
          };

          reader.readAsText(file);
        }, errorHandler);

      }, errorHandler);
    }

    // List all
    function listAll() {
      var dirReader = fs.root.createReader();
      dirReader.readEntries(function (entries) {
        for (var i = 0, entry; entry = entries[i]; ++i) {
          console.log(entry.name);
        }
      }, errorHandler);
    }


    chrome.storage.sync.get('user_info', function (res) {
      var userInfo = res.user_info[0];
      createReport(userInfo, reports);
    });

    //createReport();

    //listAll();
  }, errorHandler);
}

function errorHandler(e) {
  return true;
}

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  var totalReport = req.totalReport;
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  navigator.webkitPersistentStorage.requestQuota(
    1024 * 1024, function (grantedBytes) {
      initFS(grantedBytes, totalReport);
    }, function (e) {
      console.log('Error', e);
    }
  );
});
