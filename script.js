let timeLeft = 60;
let currentRound = 1;
let timerId = null;
let isPlaying = false;
let wakeLock = null;

const timerDisplay = document.getElementById('timer');
const roundDisplay = document.getElementById('roundNumber');
const playPauseBtn = document.getElementById('playPause');
const restartBtn = document.getElementById('restart');

function updateDisplay() {
    timerDisplay.textContent = timeLeft.toString().padStart(2, '0');
    roundDisplay.textContent = currentRound;
}

async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock successfully activated');
        
        wakeLock.addEventListener('release', () => {
            console.log('Wake Lock was released');
            if (isPlaying && document.visibilityState === 'visible') {
                requestWakeLock();
            }
        });

    } catch (err) {
        console.log('Wake Lock request failed:', err.message);
    }
}

function togglePlayPause() {
    if (isPlaying) {
        isPlaying = false;
        clearInterval(timerId);
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        // Ensure complete wake lock release when paused
        if (wakeLock) {
            wakeLock.release()
                .then(() => {
                    console.log('Wake Lock released - timer paused');
                })
                .catch(err => {
                    console.log('Error releasing wake lock:', err);
                })
                .finally(() => {
                    wakeLock = null;  // Always ensure wake lock is nullified
                });
        }
    } else {
        isPlaying = true;
        startTimer();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        requestWakeLock();
    }
}

function startTimer() {
    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft === 0) {
            if (currentRound === 40) {
                // Stop everything when timer completes
                clearInterval(timerId);
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                
                // Ensure complete wake lock release
                if (wakeLock) {
                    wakeLock.release()
                        .then(() => {
                            console.log('Wake Lock released - timer finished');
                        })
                        .catch(err => {
                            console.log('Error releasing wake lock:', err);
                        })
                        .finally(() => {
                            wakeLock = null;  // Always ensure wake lock is nullified
                        });
                }
            } else {
                currentRound++;
                timeLeft = 60;
                updateDisplay();
            }
        }
    }, 1000);
}

function restart() {
    clearInterval(timerId);
    timeLeft = 60;
    currentRound = 1;
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    updateDisplay();
}

function openAudioPlayer() {
    const audioWindow = document.createElement('div');
    audioWindow.className = 'audio-player-window';
    
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '✕';
    
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = 'meditation-thais.m4a';
    
    closeButton.onclick = function(e) {
        e.stopPropagation();
        audio.pause();
        audio.currentTime = 0;
        audioWindow.remove();
    };
    
    audioWindow.appendChild(closeButton);
    audioWindow.appendChild(audio);
    document.body.appendChild(audioWindow);

    document.addEventListener('click', function(event) {
        if (!audioWindow.contains(event.target) && !document.querySelector('.music-icon').contains(event.target)) {
            audio.pause();
            audio.currentTime = 0;
            audioWindow.remove();
        }
    });
}

playPauseBtn.addEventListener('click', togglePlayPause);
restartBtn.addEventListener('click', restart);

updateDisplay();

// Handle visibility change
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden' && isPlaying) {
        clearInterval(timerId);
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        if (wakeLock) {
            wakeLock.release().then(() => {
                wakeLock = null;
                console.log('Wake Lock released - visibility changed');
            });
        }
    }
}); 