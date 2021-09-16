
const CLIENT_ID = 'gp762nuuoqcoxypju8c569th9wz7q5';
const DIV = document.getElementById("grid-container");

const twitchForm = document.getElementById("twitch-form");
const twitchSearch = document.getElementById("twitch-search");

const header = document.getElementById("header");
const tips = document.getElementById("tips");

var offset = 0;
var limit = 100;

var liveStreams = [];

var userID = 0;

var currentDate = new Date();

load();

function load()
{
    if(twitchSearch.value)
    {
        getUser(twitchSearch.value);
    }
}

async function getUser(username)
{
    const resp = await fetch(`https://api.twitch.tv/kraken/users?login=${username}`, {
        headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': CLIENT_ID
        }
    }).then(function(response){
        
        const respData = response.json().then(function(data)
        {
            if(data._total > 0)
            {
                userID = data.users[0]._id;

                tips.firstChild.data = "User found! Loading..."; 

                getFollowedStreams(userID);
            }
            else
            {
                tips.firstChild.data = "No user found with that name..."; 
            }
        });
    });
}

async function getFollowedStreams(id)
{
    const resp = await fetch('https://api.twitch.tv/kraken/users/' + id + '/follows/channels?limit=' + limit + '&offset=' + offset +'&sortby=last_broadcast', {
            headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': CLIENT_ID
        },
    }).then(function(response)
    {
        const respData = response.json().then(function(data)
        {
            getLivestreams(data);
        });
    });
}

async function getLivestreams(data)
{
    var count = 0;

    data.follows.forEach(element => {
        getLivestream(element.channel._id).then(function(result)
        {
            if(result.stream)
            {
                liveStreams.push(result.stream);
                anyLeft = true;
            }
            count++;
            
            if(count === limit)
            {
                liveStreams.sort(function(a, b)
                {
                    return a.viewers < b.viewers;
                });

                liveStreams.forEach(element => {
                    createCardForStream(element);
                });


                header.classList.add("hidden");
            }
        });
    });
}
function getLivestream(id)
{
    return fetch('https://api.twitch.tv/kraken/streams/' + id + '?stream_type=live', {
            headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': CLIENT_ID
        },
    })
    .then(response =>
    {
        return response.json()
    });
}

function createCardForStream(stream)
{
    const cardEl = document.createElement("a");
    cardEl.classList.add("grid-item");
    cardEl.href = stream.channel.url;
    cardEl.title = stream.channel.status;

    var startDate = new Date(stream.created_at);
    var diff = Math.abs(currentDate - startDate);

    var hours   = Math.floor(diff / 3.6e6);
    var minutes = Math.floor((diff % 3.6e6) / 6e4);
    var seconds = Math.floor((diff % 6e4) / 1000);

    cardEl.innerHTML =
    `
        <div class="img-container">
            <img src="${stream.preview.medium}">
        </div>
        <div class="item-info-container">
            <p id="title">${stream.channel.display_name} <i class="fab fa-twitch"></i></p>
            <p id="status">${stream.channel.game}</p>
            <p><i class="fas fa-user"></i> ${stream.viewers} <i class="fas fa-clock"></i> ${hours}:${minutes}:${seconds}</p>
        </div>
    `;

    DIV.appendChild(cardEl);
}

twitchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = twitchSearch.value;

    header.classList.remove("hidden");

    if (user) {
        getUser(user);

        liveStreams = [];
        DIV.innerHTML = "";
    }
});

twitchSearch.addEventListener("focus", (e) =>{
    e.preventDefault();

    tips.firstChild.data = "Write an username above and press enter to see who's live on their following list!";
});