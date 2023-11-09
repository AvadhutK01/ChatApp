import React, { useState, useEffect, useCallback } from 'react';
import ChatList from './chatList';
import ChatBox from './chatBox';
import isEqual from 'lodash/isEqual';
import ChatModal from './chatModal';
import axios from 'axios';
import MemberLisstModal from './memberLisstModal';
import io from 'socket.io-client';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
const socket = io(process.env.REACT_APP_BACKEND_HOST_NAME);
const ChatMain = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [contactName, setContactName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState([])
    const [displayName, setDisplayName] = useState('');
    const [profilePicture, setprofilePicture] = useState('');
    const [memberId, setMemberId] = useState('');
    const [type, setType] = useState('');
    const [latestMessageFromMember, setlatestMessageFromMember] = useState([]);
    const [chatIdofMember, setchatIdofMember] = useState('');
    const [isAdmin, setAdmin] = useState(false);
    const [isListOpen, setIsLIstOpen] = useState(false);
    const [MemberList, setMembersList] = useState([]);
    const [action, setAction] = useState('');
    const userId = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')).userid : null
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const result = await axios.get(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/getChatList`, {
                    headers: {
                        "Authorization": token
                    }
                });
                console.log(result.data);
                setChats(result.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);
    useEffect(() => {
        try {
            socket.on('receive-message', (data) => {
                if (data.type === 'one') {
                    const receivedMessage = {
                        messageText: data.messageText,
                        date: data.date,
                        userDatumId: data.userDatumId,
                        recipeintId: data.recipeintId
                    };
                    const updatedChats = chats.map(chat => {
                        if (chat.memberId === receivedMessage.userDatumId && chat.userDatumId === receivedMessage.recipeintId) {
                            return { ...chat, isMessage: true };
                        }
                        return chat;
                    });
                    setChats(updatedChats);
                    if (!isEqual(selectedChat[selectedChat.length - 1], receivedMessage)) {
                        if ((memberId === data.recipeintId && userId === data.userDatumId) || (memberId === data.userDatumId && userId === data.recipeintId)) {
                            setSelectedChat(prevChat => [...prevChat, receivedMessage]);
                        }
                        setlatestMessageFromMember({
                            userDatumId: data.userDatumId,
                            recipeintId: data.recipeintId,
                            chatId: chatIdofMember,
                            message: data.messageText,
                            time: data.date
                        })
                    }
                }
                else if (data.type === 'many') {
                    let userName;
                    if (data.userData.memberId === userId) {
                        userName = 'You'
                    }
                    else {
                        userName = data.userData.userName
                    }
                    const receivedMessage = {
                        messageText: data.messageText,
                        date: data.date,
                        senderId: data.senderId,
                        GroupNameDatumId: data.GroupNameDatumId,
                        userName: userName
                    };
                    const updatedChats = chats.map(chat => {
                        if (chat.type === 'many' && chat.memberId === data.GroupNameDatumId) {
                            console.log(chat);
                            const updatedChat = {
                                ...chat,
                                isMessage: chat.isMessage.map(msg => {
                                    if (msg.userDatumId !== data.senderId) {
                                        return { ...msg, isMessage: true };
                                    }
                                    return msg;
                                })
                            };
                            return updatedChat;
                        }
                        return chat;
                    });
                    setChats(updatedChats);
                    if (selectedChat.length === 0 || !isEqual(selectedChat[selectedChat.length - 1], receivedMessage)) {
                        if (memberId === data.GroupNameDatumId || userId === data.senderId)
                            setSelectedChat(prevChat => [...prevChat, receivedMessage]);
                    }
                    setlatestMessageFromMember({
                        senderId: data.senderId,
                        GroupNameDatumId: data.GroupNameDatumId,
                        chatId: chatIdofMember,
                        message: data.messageText,
                        time: data.date
                    })
                }
            });
            socket.on('receive-file', (data) => {
                if (data.type === 'one') {
                    const receivedMessage = {
                        fileUrl: data.fileUrl,
                        fileName: data.fileName,
                        date: data.date,
                        userDatumId: data.userDatumId,
                        recipeintId: data.recipeintId
                    };
                    const updatedChats = chats.map(chat => {
                        if (chat.memberId === receivedMessage.userDatumId && chat.userDatumId === receivedMessage.recipeintId) {
                            return { ...chat, isMessage: true };
                        }
                        return chat;
                    });
                    setChats(updatedChats);
                    if (!isEqual(selectedChat[selectedChat.length - 1], receivedMessage)) {
                        if ((memberId === data.recipeintId && userId === data.userDatumId) || (memberId === data.userDatumId && userId === data.recipeintId)) {
                            setSelectedChat(prevChat => [...prevChat, receivedMessage]);
                        }
                        setlatestMessageFromMember({
                            userDatumId: data.userDatumId,
                            recipeintId: data.recipeintId,
                            chatId: chatIdofMember,
                            fileUrl: data.fileUrl,
                            fileName: data.fileName,
                            time: data.date
                        })
                    }
                }
                else if (data.type === 'many') {
                    let userName;
                    console.log(data);
                    if (data.userData.memberId === userId) {
                        userName = 'You'
                    }
                    else {
                        userName = data.userData.userName
                    }
                    const receivedMessage = {
                        fileUrl: data.fileUrl,
                        fileName: data.fileName,
                        date: data.date,
                        senderId: data.senderId,
                        GroupNameDatumId: data.GroupNameDatumId,
                        userName: userName
                    };
                    const updatedChats = chats.map(chat => {
                        if (chat.type === 'many' && chat.memberId === data.GroupNameDatumId) {
                            const updatedChat = {
                                ...chat,
                                isMessage: chat.isMessage.map(msg => {
                                    if (msg.userDatumId !== data.senderId) {
                                        return { ...msg, isMessage: true };
                                    }
                                    return msg;
                                })
                            };
                            return updatedChat;
                        }
                        return chat;
                    });
                    setChats(updatedChats);
                    if (selectedChat.length === 0 || !isEqual(selectedChat[selectedChat.length - 1], receivedMessage)) {
                        if (memberId === data.GroupNameDatumId || userId === data.senderId)
                            setSelectedChat(prevChat => [...prevChat, receivedMessage]);
                    }
                    setlatestMessageFromMember({
                        senderId: data.senderId,
                        GroupNameDatumId: data.GroupNameDatumId,
                        chatId: chatIdofMember,
                        fileUrl: data.fileUrl,
                        fileName: data.fileName,
                        time: data.date
                    })
                }
            });
            return () => {
                socket.off('receive-file');
                socket.off('receive-message');
            };
        } catch (err) {
            console.log(err);
        }
    }, [type, memberId, selectedChat, chatIdofMember, userId, chats, latestMessageFromMember, chats]);
    useEffect(() => {
        if (memberId && type) {
            fetchChat(memberId);
        }
    }, [type, memberId]);
    useEffect(() => {
        try {
            socket.on('addNewUser', (data => {
                const foundUser = data.find(item => item.userDatumId === userId);
                if (foundUser) {
                    const newMember = {
                        id: foundUser.id,
                        isMessage: foundUser.isMessage,
                        memberId: foundUser.memberId,
                        name: foundUser.ContactName,
                        profiePicture: foundUser.profilePicture,
                        type: foundUser.type,
                        userDatumId: foundUser.userDatumId
                    }
                    setChats((prevState) => ([...prevState, newMember]))
                }
            }))
            return () => {
                socket.off('addNewUser');
            }
        } catch (err) {
            console.log(err);
        }
    }, [])
    useEffect(() => {
        try {
            socket.on('setAdmin', (data => {
                if (userId === data.memberId) {
                    setAdmin(true);
                }
            }));
            return () => {
                socket.off('setAdmin');
            }
        } catch (err) {
            console.log(err);
        }
    }, [])

    useEffect(() => {
        try {
            socket.on('removeMember', (data => {
                const memberIdToRemove = data.memberId;
                const groupIdToRemove = data.groupId;
                const updatedChats = chats.filter(chat => {
                    if (chat.userDatumId === memberIdToRemove && chat.memberId === groupIdToRemove) {
                        return false;
                    }
                    return true;
                });
                setChats(updatedChats);
            }));

            return () => {
                socket.off('removeMember');
            };
        } catch (err) {
            console.log(err);
        }
    }, [chats]);

    useEffect(() => {
        try {
            socket.on('setMessagefalse', (data => {
                if (data.type === 'one') {
                    const userDatumId = data.userDatumId;
                    const memberId = data.memberId;
                    const updatedChats = chats.map(chat => {
                        if (chat.memberId === memberId && chat.userDatumId === userDatumId) {
                            return { ...chat, isMessage: false };
                        }
                        return chat;
                    });
                    setChats(updatedChats);
                }
                if (data.type === 'many') {
                    const userDatumId = data.userDatumId;
                    const memberId = data.memberId;
                    const updatedChats = chats.map(chat => {
                        if (chat.type === 'many' && chat.memberId === memberId) {
                            if (chat.isMessage) {
                                const updatedChat = {
                                    ...chat,
                                    isMessage: chat.isMessage.map(msg => {
                                        if (msg.userDatumId === userDatumId) {
                                            return { ...msg, isMessage: false };
                                        }
                                        return msg;
                                    })
                                };
                                return updatedChat;
                            }
                        }
                        return chat;
                    });
                    setChats(updatedChats);
                }
            }));
            return () => {
                socket.off('setMessagefalse');
            }
        }
        catch (err) {
            console.log(err);
        }
    }, [chats])

    const handleChatClick = async (chatId, displayName, type, id, lastSeen, profilePicture) => {
        try {
            setType('')
            setType(type);
            setprofilePicture(profilePicture);
            setDisplayName(displayName);
            await fetchChat(chatId);
            setchatIdofMember(id);
        } catch (err) {
            console.log(err);
        }
    };
    const handleAddGroup = async (file) => {
        try {
            const formData = new FormData();
            formData.append('Groupname', groupName);
            formData.append('avatarFile', file);

            const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/add-group`, formData, {
                headers: {
                    "Authorization": localStorage.getItem('token'),
                    'Content-Type': 'multipart/form-data'
                }
            });
            socket.emit('newMember', result.data);
            setGroupName('');
        } catch (error) {
            console.log(error);
        }
    };
    const handleAddContact = async () => {
        try {
            const data = { name: contactName, phone_number: phoneNumber };
            const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/add-contact`, { data }, {
                headers: {
                    "Authorization": localStorage.getItem('token')
                }
            });

            socket.emit('newMember', result.data);
            setContactName('');
            setPhoneNumber('');
        } catch (error) {
            console.log(error)
        }

    };

    const handleMessageSubmit = async (messageText) => {
        try {
            const currentDateTime = moment().format('DD/MM/YYYY, hh:mm:ss A')
            const data = { memberId: memberId, messageText: messageText, currentDateTime: currentDateTime };
            if (type === 'one') {
                await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/add-message`, { data }, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });
                const messageData = { recipeintId: memberId, date: currentDateTime, messageText: messageText, userDatumId: userId, type: type }
                socket.emit('send-message', messageData);
            }
            else if (type === 'many') {
                const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/add-messagetoGroup`, { data }, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });
                const messageData = { GroupNameDatumId: memberId, date: currentDateTime, messageText: messageText, senderId: userId, type: type, userData: result.data }
                socket.emit('send-message', messageData);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleFileSubmit = async (file) => {
        try {
            const currentDateTime = moment().format('DD/MM/YYYY, hh:mm:ss A');
            const fileName = file.name;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('memberId', memberId);
            formData.append('filename', fileName);
            formData.append('currentDateTime', currentDateTime);
            if (type === 'one') {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/add-file`, formData, {
                    headers: {
                        'Authorization': localStorage.getItem('token'),
                        'Content-Type': 'multipart/form-data'
                    }
                });
                const fileData = { recipeintId: memberId, date: currentDateTime, fileName: fileName, fileUrl: response.data.fileUrl, userDatumId: userId, type: type, userData: response.data }
                socket.emit('send-file', fileData);
            }
            else if (type === 'many') {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/add-fileToGroup`, formData, {
                    headers: {
                        'Authorization': localStorage.getItem('token'),
                        'Content-Type': 'multipart/form-data'
                    }
                });
                const fileData = { GroupNameDatumId: memberId, date: currentDateTime, fileName: fileName, fileUrl: response.data.fileUrl, senderId: userId, type: type, userData: response.data }
                socket.emit('send-file', fileData);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const PerformActionToGroup = async (ListMemberId, action, contactName) => {
        try {
            const data = { memberId: ListMemberId, groupId: memberId, contactName: contactName, action: action, profilePicture: profilePicture, groupName: displayName };
            const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/actionOnGroup`, { data }, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            if (action === 'addMember') {
                socket.emit('newMember', result.data);
            }
            if (action === 'setAdmin') {
                const data = { memberId: ListMemberId }
                socket.emit('setAdmin', data);
            }
            if (action === 'removeMember') {
                const data = { memberId: ListMemberId, groupId: memberId }
                socket.emit('removeMember', data);
            }
            if (action === 'leaveGroup') {
                window.location = '/chatMain'
            }
            setIsLIstOpen(false);
        }
        catch (err) {
            console.log(err);
        }
    }
    const PerformActionToContact = async (name) => {
        try {
            const data = { memberId: memberId, action: action, name: name };
            await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/actionOnContact`, { data }, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            setIsLIstOpen(false);
            window.location = `/chatMain`;
        } catch (err) {
            console.log(err);
        }
    }

    const handleGroupNameChange = (e) => {
        setGroupName(e.target.value);
    };
    const handleContactNameChange = (e) => {
        setContactName(e.target.value);
    };

    const handlePhoneNumberChange = (e) => {
        setPhoneNumber(e.target.value);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleListClose = () => {
        setIsLIstOpen(false);
    }
    async function fetchMembers(action) {
        try {
            if (action === 'addMember' || action === 'setAdmin' || action === 'removeMember') {
                const token = localStorage.getItem('token');
                const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/getMembersList`, { action, memberId }, {
                    headers: {
                        "Authorization": token
                    }
                });
                setMembersList(result.data);
            }
            else if (action === 'saveContact' || action === 'Deletecontact') {
                setMembersList([]);
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    async function fetchChat(chatId) {
        try {
            setMemberId(chatId);
            if (type === 'one' && type !== 'many') {
                const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/get-chat`, {
                    memberId: chatId,
                    chatType: 'todayChat'
                }, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });
                if (result) {
                    setMemberId(chatId);
                    setSelectedChat(result.data);
                }
                else {
                    setSelectedChat([]);
                }
                const data = { memberId: chatId, userDatumId: userId, type: 'one' }
                socket.emit('setMessagefalse', data);
            }
            else if (type === 'many' && type !== 'one') {
                const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/get-chatfromGroup`, {
                    groupId: chatId,
                    chatType: 'todayChat'
                }, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });

                if (result.data.isAdmin) {
                    setAdmin(true);
                }
                if (result.data.result) {
                    setMemberId(chatId);
                    setSelectedChat(result.data.result);
                } else {
                    setSelectedChat([]);
                }
                const data = { memberId: chatId, userDatumId: userId, type: 'many' }
                socket.emit('setMessagefalse', data);
            }
        } catch (err) {
            console.log(err);
        }
    }
    async function onChatTypeClick(chatType) {
        try {
            if (type === 'one') {
                const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/get-chat`, {
                    memberId: memberId,
                    chatType: chatType
                }, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });
                if (result) {
                    setMemberId(memberId);
                    setSelectedChat(result.data);
                }
                else {
                    setSelectedChat([]);
                }
                const data = { memberId: memberId, userDatumId: userId, type: 'one' }
                socket.emit('setMessagefalse', data);
            }
            else if (type === 'many') {
                const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/get-chatfromGroup`, {
                    groupId: memberId,
                    chatType: chatType
                }, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });

                if (result.data.isAdmin) {
                    setAdmin(true);
                }

                if (result.data.result) {
                    setMemberId(memberId);
                    setSelectedChat(result.data.result);
                } else {
                    setSelectedChat([]);
                }

            }
        }
        catch (err) {
            console.log(err);
        }
    }
    return (
        <div className="bg-gray-100">
            <div className="mx-auto flex flex-col lg:flex-row">
                <ChatList
                    chats={chats}
                    onChatClick={handleChatClick}
                    onMenuClick={() => setIsModalOpen(true)}
                    latestMessageFromMember={latestMessageFromMember}
                />
                {selectedChat && (
                    <ChatBox
                        displayName={displayName}
                        profilePicture={profilePicture}
                        chatContent={selectedChat}
                        memberId={memberId}
                        type={type}
                        isAdmin={isAdmin}
                        onMessageSubmit={handleMessageSubmit}
                        onFileSubmit={handleFileSubmit}
                        onMenuClick={
                            (action) => {
                                setAction(action)
                                fetchMembers(action)
                                setIsLIstOpen(true)
                            }
                        }
                        onChatTypeClick={onChatTypeClick}
                    />
                )}
                <ChatModal
                    isModalOpen={isModalOpen}
                    onClose={handleModalClose}
                    onAddContact={handleAddContact}
                    onAddGroup={handleAddGroup}
                    onGroupNameChange={handleGroupNameChange}
                    onContactNameChange={handleContactNameChange}
                    onPhoneNumberChange={handlePhoneNumberChange}
                    groupName={groupName}
                    contactName={contactName}
                    phoneNumber={phoneNumber}
                />
                <MemberLisstModal
                    showModal={isListOpen}
                    closeModal={handleListClose}
                    members={MemberList}
                    action={action}
                    onContactActionClick={PerformActionToContact}
                    onGroupActionClick={PerformActionToGroup}
                />
            </div>
        </div>
    );
};

export default ChatMain;
