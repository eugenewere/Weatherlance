

initWeather();
getCoordintes();
function getDayData() {
    weekdays = ["Sunday","Monday","Tuesday", "Wednesday","Thursday", "Friday", "Saturday"];
    var datte = new Date();
    return weekdays[datte.getDay()];
}
function getDateData() {
    var monthes =['Jan','Feb','Mar','Apr','May','Jun','Jul', 'Aug', 'Sept','Oct','Nov','Dec'];
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()).padStart(2, '0');
    var yyyy = today.getFullYear();
    today =monthes[Number(mm)]+ '-' + dd + '-' + yyyy;
    return today

}
function getCoordintes() {
    var options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
    };
    function showPosition(position) {
        // var crd = position.coords;
        var lat = position.coords.latitude.toString();
        var lng = position.coords.longitude.toString();
        var coordinates = [lat, lng];
        // console.log(`Latitude: ${lat}, Longitude: ${lng}`);
        getCity(coordinates);
    }
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, error, options);
        } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }
    getLocation();
    // navigator.geolocation.getCurrentPosition(success, error, options);
}
// Step 2: Get city name
function getCity(coordinates) {
    var xhr = new XMLHttpRequest();
    var lat = coordinates[0];
    var lng = coordinates[1];

    // Paste your LocationIQ token below.
    xhr.open('GET', "https://us1.locationiq.com/v1/reverse.php?key=5a036589a5a28f&lat=" + lat + "&lon=" + lng + "&format=json", true);
    xhr.send();
    xhr.onreadystatechange = processRequest;
    xhr.addEventListener("readystatechange", processRequest, false);

    function processRequest(e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            var city = response.address.city;
            localStorage.setItem('city', city);
            // console.log(city);
            return city;
        }
    }
}

var namee;
$('#submitbtn').click(function () {
    var ccity = $('#cityinput').val().toLowerCase();
    var newciry = ccity.replace(/ /g,"_")
    namee = newciry;
    console.log(newciry);
    initWeather();
});

function initWeather() {
    var url = 'https://weather-ydn-yql.media.yahoo.com/forecastrss';
    var method = 'GET';
    var app_id = 'Rt7pZz34';
    var consumer_key = 'dj0yJmk9R1FwbUJiWjZ6QUZtJmQ9WVdrOVVuUTNjRnA2TXpRbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWEx';
    var consumer_secret = '21316e0492bb2916f3a9134d2c616d1ba92a3dd6';
    var concat = '&';
    var locaton = (namee) ? namee : ((localStorage.getItem('city') ? localStorage.getItem('city'):'nakuru'));
    var query = {
        'location': locaton,
        'format': 'json',
        'u':'c'
    };
// var query = {'lat':lat, 'lon':lon, 'format': 'json'};
    var oauth = {
        'oauth_consumer_key': consumer_key,
        'oauth_nonce': Math.random().toString(36).substring(2),
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_timestamp': parseInt(new Date().getTime() / 1000).toString(),
        'oauth_version': '1.0'
    };


    var merged = {};
    $.extend(merged, query, oauth);
// Note the sorting here is required
    var merged_arr = Object.keys(merged).sort().map(function(k) {
        return [k + '=' + encodeURIComponent(merged[k])];
    });
    var signature_base_str = method
        + concat + encodeURIComponent(url)
        + concat + encodeURIComponent(merged_arr.join(concat));

    var composite_key = encodeURIComponent(consumer_secret) + concat;
    var hash = CryptoJS.HmacSHA1(signature_base_str, composite_key);
    var signature = hash.toString(CryptoJS.enc.Base64);

    oauth['oauth_signature'] = signature;
    var auth_header = 'OAuth ' + Object.keys(oauth).map(function(k) {
        return [k + '="' + oauth[k] + '"'];
    }).join(',');

    $.ajax({
        url: url + '?' + $.param(query),
        headers: {
            'Authorization': auth_header,
            'X-Yahoo-App-Id': app_id
        },
        method: 'GET',
        success: function (data) {
            recievedData(data);
        },
    });
}

function recievedData(event) {
    var stringdata = JSON.stringify(event);
    var parsedata = JSON.parse(stringdata);
    setCityNameData(parsedata);
    setTemp(parsedata);
    setForecast(parsedata);
    getOtherData(parsedata);
    setAstronomy(parsedata);
    // console.log(parsedata['current_observation']['astronomy']);
    console.log(parsedata);
    $('[data-toggle="tooltip"]').tooltip();
}
function setCityNameData(x) {

    $('.ctynm').text(x['location']['city']);
    $('.region').text(x['location']['country']+'('+x['location']['region']+')');
    $('.date-day').text(getDayData());
    $('.date-txt').text(getDateData());

}
function setTemp(e) {
    $('.w-temp').text(e['current_observation']['condition']['temperature']);
    $('.w-desc').text(e['current_observation']['condition']['text']);
    var url = "http://l.yimg.com/a/i/us/we/52/"+ e['current_observation']['condition']['code'] + ".gif";
    $('#mytodayimg').attr('src',url);
}
function getClass(m) {
    if(Number(m) === 0){
        classs = "active"
    }else {
        classs = " ";
    }
    return classs;
}
function setForecast(f) {
    var list = [];
    let i = 0;
    for (x of f['forecasts']){
        var html = '<li class="'+ getClass(i) +'">'+
                        '<span class="day-name">'+  x['day'] +'</span>'+
                        '<span class="clod">' +
                            '<img data-toggle="tooltip" tabindex="0" data-placement="top" title="'+ x['text'] +'" src="http://l.yimg.com/a/i/us/we/52/'+ x['code'] +'.gif">' +
                        '</span>'+
                        '<span class="d-flex align-items-center " style="justify-content: space-evenly;">'+
                            '<span data-toggle="tooltip" data-placement="top" title="High '+ x['high'] +'" class="day-temp">'+ x['high'] +'°C</span>'+
                            '<span data-toggle="tooltip" data-placement="top" title="High '+ x['high'] +'" style="margin-top: 10px;"><i class="fas fa-long-arrow-alt-up"></i></span>'+
                        '</span>'+
                         '<span class="d-flex align-items-center " style="justify-content: space-evenly;">'+
                            '<span data-toggle="tooltip" data-placement="bottom" title="Low '+ x['low'] +'" class="day-temp">'+ x['low'] +'°C</span>'+
                            '<span data-toggle="tooltip" data-placement="bottom" title="Low '+ x['low'] +'" style="margin-top: 10px;"><i class="fas fa-long-arrow-alt-down"></i></span>'+
                        '</span>'+
                    '</li>';

        // $('#forecst').append(html);
        i++
        list.push(x['text'])
        $(html).insertBefore('#cleat')
    }
    // console.log(list);

}
function getOtherData(o) { tabindex="0"
    $('#preas').text(o['current_observation']['atmosphere']['pressure'] +' Millibar')
    $('#humid').text(o['current_observation']['atmosphere']['humidity']+' %')
    $('#rasin').text(o['current_observation']['atmosphere']['rising'])
    $('#visibilit').text(o['current_observation']['atmosphere']['visibility']+' Km')
    $('.wind_chils').text(o['current_observation']['wind']['chill'] +' °C')
    $('.wind_speed').text(o['current_observation']['wind']['speed'] +' Km/h')
    $('.wind_direction').text(o['current_observation']['wind']['direction'] +' °')
}

var startTime;
var endTime;
function setAstronomy(k) {
    $('.sunrise').text('Sunrise '+convertTime12to24(k['current_observation']['astronomy']['sunrise']));
    $('.sunset').text( convertTime12to24(k['current_observation']['astronomy']['sunset'])+' Sunset');
     $('.sunrise1').text(convertTime12to24(k['current_observation']['astronomy']['sunrise']));
    $('.sunset1').text(convertTime12to24(k['current_observation']['astronomy']['sunset']));

    startTime=moment(k['current_observation']['astronomy']['sunrise'], 'hh:mm:ss a');
    endTime = moment(k['current_observation']['astronomy']['sunset'], 'hh:mm:ss a');
    activeTime();

}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
// console.log(formatAMPM(new Date));
function activeTime(){
    var  dif = endTime.diff(startTime, 'hours')
    var currentTime = formatAMPM(new Date);
    var currentTimemomment = moment(currentTime, 'hh:mm:ss a');
    var currentTimemommentdiff = currentTimemomment.diff(startTime, 'hours')
    // console.log(currentTimemommentdiff, dif)
    if(currentTimemommentdiff > 0){
        var tt =(currentTimemommentdiff/dif)*100;
        $('.sunmoon .sun-animation').css('width', tt+'%');
        // $('.sun-symbol-path').css('-webkit-transform', 'rotateZ('+ tt-43 +'deg)');
    }else {
        $('.sun-animation').css('width', '0%');
        // $('.sun-symbol-path').css('-webkit-transform', 'rotateZ(-45deg)');
        var tt =(currentTimemommentdiff/dif)*100;
        console.log(tt);


    }
}
setInterval(activeTime, 60000);
// $('.start').click(function () {
//     $('.sunmoon .sun-animation').css('width', '70%');
//     $('.sun-symbol-path').css('-webkit-transform', 'rotateZ(27deg)');
//     // TODO: mention that this isn't nice
//     // city.find('.sunmoon .sun-animation').css('-webkit-transform', 'scaleX(50)');
//     return false;
// });
//
// $('.reset').click(function () {
//     $('.sun-animation').css('width', '0%');
//     $('.sun-symbol-path').css('-webkit-transform', 'rotateZ(-75deg)');
//     return false;
// });


const convertTime12to24 = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12' ) {hours = '00';}
    if (modifier === 'PM' || modifier === 'pm') {   hours = parseInt(hours, 10) + 12;}
    return `${hours}:${minutes}`;
}
$('#cityinput').keyup(function () {
    if($(this).val().length > 0){
        $('#submitbtn').removeAttr('disabled');
    }
    else {
        $('#submitbtn').attr('disabled', 'disabled');
    }
});
