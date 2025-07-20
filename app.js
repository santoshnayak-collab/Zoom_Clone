// VideoMeet Application JavaScript

class VideoMeetApp {
    constructor() {
        this.currentScreen = 'welcome-screen';
        this.currentUser = null;
        this.currentMeeting = null;
        this.isAudioEnabled = true;
        this.isVideoEnabled = true;
        this.isScreenSharing = false;
        this.isRecording = false;
        this.chatMessages = [];
        this.participants = [];
        this.meetingStartTime = null;
        
        // Initialize app data
        this.initializeData();
        this.bindEvents();
        this.populateRecentMeetings();
    }

    initializeData() {
        // Mock data from the provided JSON
        this.meetingRooms = [
            {"id": "123456789", "name": "Team Standup", "participants": 8, "host": "John Smith"},
            {"id": "987654321", "name": "Project Review", "participants": 12, "host": "Sarah Johnson"},
            {"id": "456789123", "name": "Client Meeting", "participants": 5, "host": "Mike Davis"}
        ];

        this.participants = [
            {"id": 1, "name": "John Smith", "role": "Host", "audio": true, "video": true, "speaking": false},
            {"id": 2, "name": "Sarah Johnson", "role": "Participant", "audio": true, "video": true, "speaking": true},
            {"id": 3, "name": "Mike Davis", "role": "Participant", "audio": false, "video": true, "speaking": false},
            {"id": 4, "name": "Lisa Wilson", "role": "Participant", "audio": true, "video": false, "speaking": false},
            {"id": 5, "name": "Tom Brown", "role": "Participant", "audio": true, "video": true, "speaking": false},
            {"id": 6, "name": "Emma White", "role": "Participant", "audio": true, "video": true, "speaking": false}
        ];

        this.chatMessages = [
            {"id": 1, "sender": "Sarah Johnson", "message": "Good morning everyone!", "timestamp": "9:00 AM", "type": "text"},
            {"id": 2, "sender": "Mike Davis", "message": "Hello! Ready for the meeting", "timestamp": "9:01 AM", "type": "text"},
            {"id": 3, "sender": "Lisa Wilson", "message": "Can everyone hear me okay?", "timestamp": "9:02 AM", "type": "text"},
            {"id": 4, "sender": "John Smith", "message": "Yes, audio is clear. Let's begin.", "timestamp": "9:03 AM", "type": "text"},
            {"id": 5, "sender": "Tom Brown", "message": "I'll share my screen in a moment", "timestamp": "9:04 AM", "type": "text"},
            {"id": 6, "sender": "Emma White", "message": "Great! Looking forward to the presentation", "timestamp": "9:05 AM", "type": "text"}
        ];

        this.meetingStats = {
            "duration": "00:15:32",
            "participantCount": 6,
            "connectionQuality": "Good",
            "bandwidth": "1.2 Mbps",
            "meetingId": "123-456-789"
        };
    }

    bindEvents() {
        // Welcome screen events
        document.getElementById('new-meeting-btn').addEventListener('click', () => this.startNewMeeting());
        document.getElementById('join-meeting-btn').addEventListener('click', () => this.showJoinScreen());
        
        // Join screen events
        document.getElementById('back-to-welcome').addEventListener('click', () => this.showWelcomeScreen());
        document.getElementById('join-form').addEventListener('submit', (e) => this.handleJoinForm(e));
        
        // Setup screen events
        document.getElementById('setup-back').addEventListener('click', () => this.showJoinScreen());
        document.getElementById('join-now-btn').addEventListener('click', () => this.joinMeeting());
        document.getElementById('toggle-preview-video').addEventListener('click', () => this.togglePreviewVideo());
        document.getElementById('toggle-preview-audio').addEventListener('click', () => this.togglePreviewAudio());
        
        // Meeting room events
        document.getElementById('mute-btn').addEventListener('click', () => this.toggleMute());
        document.getElementById('video-btn').addEventListener('click', () => this.toggleVideo());
        document.getElementById('screen-share-btn').addEventListener('click', () => this.toggleScreenShare());
        document.getElementById('chat-btn').addEventListener('click', () => this.toggleChat());
        document.getElementById('participants-btn').addEventListener('click', () => this.toggleParticipants());
        document.getElementById('record-btn').addEventListener('click', () => this.toggleRecording());
        document.getElementById('leave-btn').addEventListener('click', () => this.showLeaveModal());
        document.getElementById('layout-toggle').addEventListener('click', () => this.toggleVideoLayout());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettingsModal());
        
        // Chat events
        document.getElementById('send-message').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
        document.getElementById('close-chat').addEventListener('click', () => this.closeChat());
        document.getElementById('close-participants').addEventListener('click', () => this.closeParticipants());
        
        // Modal events
        document.getElementById('cancel-leave').addEventListener('click', () => this.hideLeaveModal());
        document.getElementById('confirm-leave').addEventListener('click', () => this.leaveMeeting());
        document.getElementById('close-settings').addEventListener('click', () => this.hideSettingsModal());
        
        // Settings tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSettingsTab(e.target.dataset.tab));
        });
        
        // Toast close
        document.getElementById('toast-close').addEventListener('click', () => this.hideToast());
        
        // Click outside modals to close
        document.getElementById('leave-modal').addEventListener('click', (e) => {
            if (e.target.id === 'leave-modal') this.hideLeaveModal();
        });
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') this.hideSettingsModal();
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    showWelcomeScreen() {
        this.showScreen('welcome-screen');
    }

    showJoinScreen() {
        this.showScreen('join-screen');
    }

    showSetupScreen() {
        this.showScreen('setup-screen');
    }

    showMeetingRoom() {
        this.showScreen('meeting-room');
        this.startMeetingTimer();
        this.renderVideoGrid();
        this.renderParticipantsList();
        this.renderChatMessages();
    }

    startNewMeeting() {
        // Generate random meeting ID
        const meetingId = Math.floor(Math.random() * 900000000) + 100000000;
        document.getElementById('meeting-id').value = meetingId.toString();
        document.getElementById('display-name').value = 'Host';
        this.showSetupScreen();
    }

    handleJoinForm(e) {
        e.preventDefault();
        const meetingId = document.getElementById('meeting-id').value;
        const displayName = document.getElementById('display-name').value;
        const joinAudio = document.getElementById('join-audio').checked;
        const joinVideo = document.getElementById('join-video').checked;
        
        if (!meetingId || !displayName) {
            this.showToast('Please enter meeting ID and your name');
            return;
        }
        
        this.currentUser = {
            name: displayName,
            audio: joinAudio,
            video: joinVideo
        };
        
        this.isAudioEnabled = joinAudio;
        this.isVideoEnabled = joinVideo;
        
        this.showSetupScreen();
    }

    togglePreviewVideo() {
        this.isVideoEnabled = !this.isVideoEnabled;
        const videoIcon = document.getElementById('video-icon');
        const previewVideo = document.getElementById('preview-video');
        
        if (this.isVideoEnabled) {
            videoIcon.textContent = '📹';
            previewVideo.style.backgroundColor = 'var(--color-charcoal-800)';
        } else {
            videoIcon.textContent = '📹';
            previewVideo.style.backgroundColor = 'var(--color-error)';
        }
    }

    togglePreviewAudio() {
        this.isAudioEnabled = !this.isAudioEnabled;
        const audioIcon = document.getElementById('audio-icon');
        
        if (this.isAudioEnabled) {
            audioIcon.textContent = '🎤';
        } else {
            audioIcon.textContent = '🎤';
        }
    }

    joinMeeting() {
        this.currentMeeting = this.meetingRooms[0]; // Use first meeting as default
        this.meetingStartTime = new Date();
        this.showMeetingRoom();
        this.showToast('Successfully joined the meeting');
    }

    renderVideoGrid() {
        const videoGrid = document.getElementById('video-grid');
        videoGrid.innerHTML = '';
        
        // Add current user first
        if (this.currentUser) {
            const userTile = this.createVideoTile({
                name: this.currentUser.name + ' (You)',
                video: this.isVideoEnabled,
                audio: this.isAudioEnabled,
                speaking: false
            });
            videoGrid.appendChild(userTile);
        }
        
        // Add other participants
        this.participants.forEach(participant => {
            const tile = this.createVideoTile(participant);
            videoGrid.appendChild(tile);
        });
    }

    createVideoTile(participant) {
        const tile = document.createElement('div');
        tile.className = `video-tile ${participant.speaking ? 'speaking' : ''}`;
        
        // Simulate video content
        const avatarEmoji = this.getAvatarEmoji(participant.name);
        
        tile.innerHTML = `
            <div style="font-size: 48px;">${participant.video ? avatarEmoji : '📷'}</div>
            <div class="name-tag">
                ${participant.name}
                ${!participant.audio ? ' 🔇' : ''}
                ${!participant.video ? ' 📷' : ''}
            </div>
        `;
        
        if (!participant.video) {
            tile.style.backgroundColor = 'var(--color-slate-500)';
        }
        
        return tile;
    }

    getAvatarEmoji(name) {
        const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨', '👩', '🧑‍💼', '🧑‍💻'];
        const index = name.charCodeAt(0) % avatars.length;
        return avatars[index];
    }

    toggleMute() {
        this.isAudioEnabled = !this.isAudioEnabled;
        const muteIcon = document.getElementById('mute-icon');
        const muteBtn = document.getElementById('mute-btn');
        
        if (this.isAudioEnabled) {
            muteIcon.textContent = '🎤';
            muteBtn.querySelector('.control-label').textContent = 'Mute';
            muteBtn.style.backgroundColor = 'var(--color-secondary)';
        } else {
            muteIcon.textContent = '🔇';
            muteBtn.querySelector('.control-label').textContent = 'Unmute';
            muteBtn.style.backgroundColor = 'var(--color-error)';
        }
        
        this.renderVideoGrid();
        this.showToast(this.isAudioEnabled ? 'Microphone unmuted' : 'Microphone muted');
    }

    toggleVideo() {
        this.isVideoEnabled = !this.isVideoEnabled;
        const videoIcon = document.getElementById('video-control-icon');
        const videoBtn = document.getElementById('video-btn');
        
        if (this.isVideoEnabled) {
            videoIcon.textContent = '📹';
            videoBtn.querySelector('.control-label').textContent = 'Video';
            videoBtn.style.backgroundColor = 'var(--color-secondary)';
        } else {
            videoIcon.textContent = '📷';
            videoBtn.querySelector('.control-label').textContent = 'Start Video';
            videoBtn.style.backgroundColor = 'var(--color-error)';
        }
        
        this.renderVideoGrid();
        this.showToast(this.isVideoEnabled ? 'Camera turned on' : 'Camera turned off');
    }

    toggleScreenShare() {
        this.isScreenSharing = !this.isScreenSharing;
        const shareBtn = document.getElementById('screen-share-btn');
        const videoArea = document.getElementById('video-area');
        const screenShareArea = document.getElementById('screen-share-area');
        
        if (this.isScreenSharing) {
            shareBtn.style.backgroundColor = 'var(--color-primary)';
            shareBtn.style.color = 'var(--color-btn-primary-text)';
            videoArea.classList.add('hidden');
            screenShareArea.classList.remove('hidden');
            this.showToast('Screen sharing started');
        } else {
            shareBtn.style.backgroundColor = 'var(--color-secondary)';
            shareBtn.style.color = 'var(--color-text)';
            videoArea.classList.remove('hidden');
            screenShareArea.classList.add('hidden');
            this.showToast('Screen sharing stopped');
        }
    }

    toggleChat() {
        const chatSidebar = document.getElementById('chat-sidebar');
        const participantsSidebar = document.getElementById('participants-sidebar');
        
        // Close participants if open
        participantsSidebar.classList.add('hidden');
        
        if (chatSidebar.classList.contains('hidden')) {
            chatSidebar.classList.remove('hidden');
            this.clearChatBadge();
        } else {
            chatSidebar.classList.add('hidden');
        }
    }

    toggleParticipants() {
        const participantsSidebar = document.getElementById('participants-sidebar');
        const chatSidebar = document.getElementById('chat-sidebar');
        
        // Close chat if open
        chatSidebar.classList.add('hidden');
        
        if (participantsSidebar.classList.contains('hidden')) {
            participantsSidebar.classList.remove('hidden');
        } else {
            participantsSidebar.classList.add('hidden');
        }
    }

    closeChat() {
        document.getElementById('chat-sidebar').classList.add('hidden');
    }

    closeParticipants() {
        document.getElementById('participants-sidebar').classList.add('hidden');
    }

    toggleRecording() {
        this.isRecording = !this.isRecording;
        const recordBtn = document.getElementById('record-btn');
        
        if (this.isRecording) {
            recordBtn.style.backgroundColor = 'var(--color-error)';
            recordBtn.style.color = 'var(--color-btn-primary-text)';
            this.showToast('Recording started');
        } else {
            recordBtn.style.backgroundColor = 'var(--color-secondary)';
            recordBtn.style.color = 'var(--color-text)';
            this.showToast('Recording stopped');
        }
    }

    toggleVideoLayout() {
        const layoutBtn = document.getElementById('layout-toggle');
        const currentLayout = layoutBtn.textContent;
        
        const layouts = ['Gallery View', 'Speaker View', 'Spotlight'];
        const currentIndex = layouts.indexOf(currentLayout);
        const nextIndex = (currentIndex + 1) % layouts.length;
        
        layoutBtn.textContent = layouts[nextIndex];
        this.showToast(`Switched to ${layouts[nextIndex]}`);
    }

    renderChatMessages() {
        const chatContainer = document.getElementById('chat-messages');
        chatContainer.innerHTML = '';
        
        this.chatMessages.forEach(message => {
            const messageEl = document.createElement('div');
            messageEl.className = 'chat-message';
            messageEl.innerHTML = `
                <div class="sender">${message.sender}</div>
                <div class="message">${message.message}</div>
                <div class="timestamp">${message.timestamp}</div>
            `;
            chatContainer.appendChild(messageEl);
        });
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        const newMessage = {
            id: this.chatMessages.length + 1,
            sender: this.currentUser ? this.currentUser.name : 'You',
            message: message,
            timestamp: new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            }),
            type: 'text'
        };
        
        this.chatMessages.push(newMessage);
        this.renderChatMessages();
        chatInput.value = '';
        
        // Simulate incoming message after 2 seconds
        setTimeout(() => {
            const responses = [
                'Thanks for sharing!',
                'Great point!',
                'I agree with that.',
                'Interesting perspective.',
                'Let me check that.',
                'Sounds good to me!'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            const randomParticipant = this.participants[Math.floor(Math.random() * this.participants.length)];
            
            const responseMessage = {
                id: this.chatMessages.length + 1,
                sender: randomParticipant.name,
                message: randomResponse,
                timestamp: new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                }),
                type: 'text'
            };
            
            this.chatMessages.push(responseMessage);
            this.renderChatMessages();
            
            // Show chat badge if chat is closed
            const chatSidebar = document.getElementById('chat-sidebar');
            if (chatSidebar.classList.contains('hidden')) {
                this.showChatBadge();
            }
        }, 2000);
    }

    showChatBadge() {
        const badge = document.getElementById('chat-badge');
        badge.classList.remove('hidden');
        let count = parseInt(badge.textContent) || 0;
        badge.textContent = count + 1;
    }

    clearChatBadge() {
        document.getElementById('chat-badge').classList.add('hidden');
    }

    renderParticipantsList() {
        const participantsList = document.getElementById('participants-list');
        participantsList.innerHTML = '';
        
        // Add current user first
        if (this.currentUser) {
            const userItem = document.createElement('div');
            userItem.className = 'participant-item';
            userItem.innerHTML = `
                <div class="name">${this.currentUser.name} (You)</div>
                <div class="status-badge">Host</div>
            `;
            participantsList.appendChild(userItem);
        }
        
        this.participants.forEach(participant => {
            const item = document.createElement('div');
            item.className = 'participant-item';
            item.innerHTML = `
                <div class="name">
                    ${participant.name}
                    ${!participant.audio ? ' 🔇' : ''}
                    ${!participant.video ? ' 📷' : ''}
                </div>
                <div class="status-badge">${participant.role}</div>
            `;
            participantsList.appendChild(item);
        });
        
        // Update participant count
        const totalParticipants = 1 + this.participants.length;
        document.getElementById('sidebar-participant-count').textContent = totalParticipants;
        document.getElementById('participant-count').textContent = `${totalParticipants} participants`;
    }

    populateRecentMeetings() {
        const recentMeetings = document.getElementById('recent-meetings');
        recentMeetings.innerHTML = '';
        
        this.meetingRooms.forEach(meeting => {
            const meetingItem = document.createElement('div');
            meetingItem.className = 'meeting-item';
            meetingItem.innerHTML = `
                <div>
                    <div style="font-weight: 500;">${meeting.name}</div>
                    <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                        ID: ${meeting.id} • ${meeting.participants} participants
                    </div>
                </div>
                <button class="btn btn--outline btn--sm join-recent-btn" data-meeting-id="${meeting.id}">Join</button>
            `;
            recentMeetings.appendChild(meetingItem);
        });
        
        // Add event listeners for join buttons
        document.querySelectorAll('.join-recent-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const meetingId = e.target.dataset.meetingId;
                document.getElementById('meeting-id').value = meetingId;
                this.showJoinScreen();
            });
        });
    }

    startMeetingTimer() {
        this.meetingStartTime = new Date();
        this.updateMeetingDuration();
        
        setInterval(() => {
            this.updateMeetingDuration();
        }, 1000);
    }

    updateMeetingDuration() {
        if (!this.meetingStartTime) return;
        
        const elapsed = new Date() - this.meetingStartTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('meeting-duration').textContent = duration;
    }

    showLeaveModal() {
        document.getElementById('leave-modal').classList.remove('hidden');
    }

    hideLeaveModal() {
        document.getElementById('leave-modal').classList.add('hidden');
    }

    leaveMeeting() {
        this.hideLeaveModal();
        this.showWelcomeScreen();
        this.showToast('You left the meeting');
        
        // Reset meeting state
        this.currentMeeting = null;
        this.meetingStartTime = null;
        this.isScreenSharing = false;
        this.isRecording = false;
        
        // Close sidebars
        document.getElementById('chat-sidebar').classList.add('hidden');
        document.getElementById('participants-sidebar').classList.add('hidden');
    }

    showSettingsModal() {
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    hideSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    switchSettingsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-settings`).classList.add('active');
    }

    showToast(message, duration = 3000) {
        const toast = document.getElementById('notification-toast');
        const messageEl = document.getElementById('toast-message');
        
        messageEl.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            this.hideToast();
        }, duration);
    }

    hideToast() {
        document.getElementById('notification-toast').classList.add('hidden');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoMeetApp();
});