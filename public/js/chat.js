//create a connection with the server
let socket=io();
socket.on('connect',function (){
    console.log('connected to the server')
    const params=jQuery.deparam(window.location.search);
    socket.emit('join',params,function (err){
        if(err){
            alert(err);
            window.location.href='/';
        }else {
            jQuery('#chat-name').text(`${params.room} room`);
        }
    })
})
function scrollToBottom(){
    const messages=jQuery('#messages');
    const newMessage=messages.children('li:last-child');

    const clientHeight=messages.prop('clientHeight');
    const scrollTop=messages.prop('scrollTop');
    const scrollHeight=messages.prop('scrollHeight');
    const newMessageHeight=newMessage.innerHeight();
    const lastMessageHeight=newMessage.prev().innerHeight();
    if(clientHeight+scrollTop+newMessageHeight+lastMessageHeight>=scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}
socket.on('updateUserList',function (users){
    const ol=jQuery('<ol></ol>');
    console.log(users);
    users.forEach(user=>{
        ol.append(jQuery('<li></li>').text(user));
    })
    jQuery('#users').html(ol);
})
const renderMessages=function (msg,body){
    const formatedTime = moment(msg.createdAt).format('h:mm a')
    const template = jQuery('#message-template').html();
    const params=jQuery.deparam(window.location.search);
    const html=Mustache.render(template,{
        element:body,
        createdAt:formatedTime,
        from:(msg.from===params.name)?'You':msg.from,
    })
    jQuery('#messages').append(html);
    scrollToBottom();
}
socket.on('newMessage',function (msg){
   renderMessages(msg,`<p>${msg.text}</p>`)
})

socket.on('newLocationMessage',function (msg) {
    const body=`<p><a href="${msg.url}" target="_blank">My current location</a></p>`;
    renderMessages(msg,body);
})
const handleData = function (message) {
    const formattedTime = moment(message.createdAt).format('h:mm a');
    const template = $(`#message-template`).html();
    const html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });

    $('#messages').append(html);
}
socket.on('disconnect',function (){
    console.log('disconnected from the server')
})
const messageForm=jQuery("#message-form");
const sendLocationBtn=jQuery("#send-location");

if(messageForm){
    messageForm.on('submit',function (e){
        e.preventDefault();
        const messageTextbox=jQuery('[name=message]');
        socket.emit('createMessage',{
            text:messageTextbox.val(),
        },function (ack){
            messageTextbox.val('');
        })
    })
}

sendLocationBtn.on('click',function (){
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser');
    }
    sendLocationBtn.attr('disabled','disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function (position){
        console.log(position);
        sendLocationBtn.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude,
        })
    },function (){
        sendLocationBtn.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location');
    })
})
jQuery('#photo-input').on('change', function (e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();//read the content of the file

    reader.onload = function (e) {
        console.log(e.target.result);
        socket.emit('createPhotoMessage', {
            type:'photo',
            data: e.target.result,
        });
    };

    reader.readAsDataURL(file);
});
let mediaRecorder;
let chunks = []; // Define chunks array at the top level
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = function (e) {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };
            mediaRecorder.onstop = function () {
                const blob = new Blob(chunks, { type: 'audio/wav' });

                const reader = new FileReader();
                reader.onload = function (e) {
                    const audioData = e.target.result;
                    socket.emit('createAudioMessage', { type:'audio',data: audioData });
                };
                reader.readAsDataURL(blob);

                chunks = []; // Clear chunks array after sending
            };


            mediaRecorder.start();
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
        });
}

// Start recording on button click
jQuery('#start-record-btn').on('click', startRecording);

// Stop recording on button click
jQuery('#stop-record-btn').on('click', function () {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        console.log('Recording stopped.');
    } else {
        console.warn('MediaRecorder is not recording.');
    }
});
socket.on('newAudioMessage',function (msg){
    const body=`<audio controls> <source src="${msg.url}" type="audio/wav">`+
        'Your browser does not support the audio element.</audio>'
    console.log(body);
    renderMessages(msg,body);
});

socket.on('newPhotoMessage',function (msg){
    const body=`<img src="${msg.url}" alt="User photo" style="max-width: 100%;">`
    renderMessages(msg,body);
});

jQuery('#leave-room').on('click',function (){
    socket.emit('disconnect');
    window.location.href ='/index.html';
})
