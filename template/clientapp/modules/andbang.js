(function () {

    // Utils and references
    var root = this,
        slice = Array.prototype.slice,
        isFunc = function (obj) {
            return Object.prototype.toString.call(obj) == '[object Function]';
        },
        extend = function (obj1, obj2) {
            for (var i in obj2) obj1[i] = obj2[i];
        };

    // Conditionally import socket.io-client or just use global if present
    root.io || (root.io = require('socket.io-client'));

    function WildEmitter() {
        this.callbacks = {};
    }
    
    // Listen on the given `event` with `fn`. Store a group name if present.
    WildEmitter.prototype.on = function (event, groupName, fn) {
        var hasGroup = (arguments.length === 3),
            group = hasGroup ? arguments[1] : undefined, 
            func = hasGroup ? arguments[2] : arguments[1];
        func._groupName = group;
        (this.callbacks[event] = this.callbacks[event] || []).push(func);
        return this;
    };
    
    // Adds an `event` listener that will be invoked a single
    // time then automatically removed.
    WildEmitter.prototype.once = function (event, fn) {
        var self = this;
        function on() {
            self.off(event, on);
            fn.apply(this, arguments);
        }
        this.on(event, on);
        return this;
    };
    
    // Unbinds an entire group
    WildEmitter.prototype.releaseGroup = function (groupName) {
        var item, i, len, handlers;
        for (item in this.callbacks) {
            handlers = this.callbacks[item];
            for (i = 0, len = handlers.length; i < len; i++) {
                if (handlers[i]._groupName === groupName) {
                    //console.log('removing');
                    // remove it and shorten the array we're looping through
                    handlers.splice(i, 1);
                    i--;
                    len--;
                }
            }
        }
        return this;
    };
    
    // Remove the given callback for `event` or all
    // registered callbacks.
    WildEmitter.prototype.off = function (event, fn) {
        var callbacks = this.callbacks[event],
            i;
        
        if (!callbacks) return this;
    
        // remove all handlers
        if (arguments.length === 1) {
            delete this.callbacks[event];
            return this;
        }
    
        // remove specific handler
        i = callbacks.indexOf(fn);
        callbacks.splice(i, 1);
        return this;
    };
    
    // Emit `event` with the given args.
    // also calls any `*` handlers
    WildEmitter.prototype.emit = function (event) {
        var args = [].slice.call(arguments, 1),
            callbacks = this.callbacks[event],
            specialCallbacks = this.getWildcardCallbacks(event),
            i,
            len,
            item;
    
        if (callbacks) {
            for (i = 0, len = callbacks.length; i < len; ++i) {
                callbacks[i].apply(this, args);
            }
        }
    
        if (specialCallbacks) {
            for (i = 0, len = specialCallbacks.length; i < len; ++i) {
                specialCallbacks[i].apply(this, [event].concat(args));
            }
        }
    
        return this;
    };
    
    // Helper for for finding special wildcard event handlers that match the event
    WildEmitter.prototype.getWildcardCallbacks = function (eventName) {
        var item,
            split,
            result = [];
    
        for (item in this.callbacks) {
            split = item.split('*');
            if (item === '*' || (split.length === 2 && eventName.slice(0, split[1].length) === split[1])) {
                result = result.concat(this.callbacks[item]);
            }
        }
        return result;
    };

    // Main export
    var AndBang = function (config) {
        var self = this,
            opts = this.config = {
                url: 'https://api.andbang.com:443',
                transports: ['websocket', 'flashsocket', 'htmlfile', 'xhr-multipart', 'xhr-polling', 'jsonp-polling'],
                reconnectAttempts: 20,
                autoConnect: true,
                autoSubscribe: true
            };

        // use our config settings
        extend(opts, config);
        
        // extend with emitter
        WildEmitter.call(this);

        // if tokens are passed in, connect right away
        if (opts.token && opts.autoConnect) this.validateToken(opts.token);
    };

    // inherit from emitter
    AndBang.prototype = new WildEmitter();

    // validate a token
    AndBang.prototype.validateToken = function (token, optionalCallback) {
        var self = this,
            currentArgs = arguments,
            cb = optionalCallback || function () {};
        if (this.connected) {
            this.socket.emit('validateSession', token, function (err, user) {
                if (user) {
                    // autosubscribe
                    if (self.config.autoSubscribe) self.socket.emit('subscribeTeams');
                    self.emit('ready', user);
                    cb(null, true);
                } else {
                    self.emit('loginFailed');
                    cb('Could not log in with token');
                }
            });
        } else {
            // if not connected, connect first, then validate
            this.connect(function () {
                self.validateToken.apply(self, currentArgs);
            });
        }
    };

    // connect function
    AndBang.prototype.connect = function (cb) {
        var self = this,
            apiEvents = [
                'editMember',
                'online',
                'offline',
                'clearNotifications',
                'editTeam',
                'editTask',
                'assignTask',
                'deleteTask',
                'shipTask',
                'unshipTask',
                'watchTask',
                'unwatchTask',
                'laterTask',
                'unlaterTask',
                'startTask',
                'stopTask',
                'sortTask',
                'newTask',
                'interaction',
                'setLastReadNotification',
                'setLastReadTeamChat',
                'setLastReadDirectChat',
                'setDirectChatState',
                'resetLastInteraction',
                'removeMember',
                'notification',
                'addMember',
                'deleteInvite',
                'chat',
                'directChat'
            ],
            i = 0,
            l = apiEvents.length;
        
        // set up our socket.io connection
        this.socket = root.io.connect(this.config.url, {
            'max reconnection attempts': this.config.reconnectAttempts,
            'transports': this.config.transports,
            'force new connection': true
        });

        // emit connect event and call callback if passed in
        this.socket.on('connect', function () { 
            self.connected = true;
            self.emit('connected');
            if (cb) cb(); 
        });

        // emit disconnected set flag
        this.socket.on('disconnect', function () {
            self.connected = false;
            self.emit('disconnected');
        });

        // gracefully, seamlessly handle reconnects
        this.socket.on('reconnect', function () {
            if (self.lastEvent) {
                // we have to to this 'next tick' because otherwise the server doesn't know
                // who we are yet, it's weird.
                setTimeout(function () {
                    self.socket.emit('getEventsSinceId', self.lastEvent, function (err, res) {
                        var parsed;
                            
                        // if it's been too long and we don't have any events
                        // emit a staleReconnect and then disconnect from the api.
                        if (err) {
                            self.emit('staleReconnect');
                            self.disconnect();
                        } else {
                            res.forEach(function (event) {
                                self.emit(event.channel, event);
                            });
                        }
                    });
                }, 0);
            }
        });

        // emit connection error if it's auth failure.
        // and emit other errors too.
        this.socket.on('error', function (reason) {
            if (reason === 'handshake unauthorized') self.emit('connectFail');
            self.emit('error', reason);
        });

        // passthrough of our events so that the API will emit them directly.
        for (; i < l; i++) {
            this.socket.on(apiEvents[i], function (event) {
                return function (payload) {
                    // tack on last received event for tracking
                    if (payload.eventNumber) self.lastEvent = payload.eventNumber;
                    self.emit(event, payload);
                };
            }(apiEvents[i]));
        }
    };

    // Handles translating multiple arguments into an array of args
    // since socket.io limits us to sending a single object as a payload.
    AndBang.prototype._callApi = function (method, incomingArgs, numArgs, hasOptionalParam) {
        var myArray = slice.call(incomingArgs),
            last = myArray[myArray.length - 1],
            cb = isFunc(last) ? last : null,
            args = cb ? slice.call(myArray, 0, myArray.length - 1) : myArray;

        if (hasOptionalParam && args.length != numArgs) {
            args.push({});
        }

        var wrappedCallback = function (err, data, code) {
            if (!cb) return;
            if (typeof data === 'string') {
                cb(err, JSON.parse(data), code); 
            } else {
                cb(err, data, code); 
            }
        };
            
        if (args.length) {
            this.socket.emit(method, args, wrappedCallback);
        } else {
            this.socket.emit(method, wrappedCallback);
        }
    };

    AndBang.prototype.disconnect = function () {
        this.socket.disconnect();
    };

    // Get the user properties of the logged in user.
    AndBang.prototype.getMe = function (cb) {
        this._callApi('getMe', arguments, 0, false);
    };
    
    // Update the user properties of the logged in user.
    AndBang.prototype.updateMe = function (userAttributes, cb) {
        this._callApi('updateMe', arguments, 1, false);
    };
    
    // Sets &#39;presence&#39; attribute to &#39;online&#39; for all teams you&#39;re on.
    AndBang.prototype.goOnline = function (cb) {
        this._callApi('goOnline', arguments, 0, false);
    };
    
    // Sets &#39;presence&#39; attribute to &#39;offline&#39; for all teams you&#39;re on.
    AndBang.prototype.goOffline = function (cb) {
        this._callApi('goOffline', arguments, 0, false);
    };
    
    // Get team attributes of teams that you&#39;re part of.
    AndBang.prototype.getMyTeams = function (cb) {
        this._callApi('getMyTeams', arguments, 0, false);
    };
    
    // Get team attributes and related data for all teams you&#39;re part of.
    AndBang.prototype.getAllMyTeamData = function (cb) {
        this._callApi('getAllMyTeamData', arguments, 0, false);
    };
    
    // Get notifications for my user in a given team. The newest ones are always returned first. Only the last 50 are kept in the database. So there&#39;s no need to limit requests.
    AndBang.prototype.getMyNotifications = function (teamId, cb) {
        this._callApi('getMyNotifications', arguments, 1, false);
    };
    
    // Clear all notifications for my user in a given team.
    AndBang.prototype.clearMyNotifications = function (teamId, cb) {
        this._callApi('clearMyNotifications', arguments, 1, false);
    };
    
    // Gets full task details for a given task.
    AndBang.prototype.getTask = function (teamId, taskId, cb) {
        this._callApi('getTask', arguments, 2, false);
    };
    
    // Updates task attributes.
    AndBang.prototype.updateTask = function (teamId, taskId, taskAttributes, cb) {
        this._callApi('updateTask', arguments, 3, false);
    };
    
    // Assigns a task to another team member.
    AndBang.prototype.assignTask = function (teamId, taskId, userId, cb) {
        this._callApi('assignTask', arguments, 3, false);
    };
    
    // Deletes a task completely.
    AndBang.prototype.deleteTask = function (teamId, taskId, cb) {
        this._callApi('deleteTask', arguments, 2, false);
    };
    
    // In And Bang we call completing a task &quot;shipping&quot;. This method does that.
    AndBang.prototype.shipTask = function (teamId, taskId, cb) {
        this._callApi('shipTask', arguments, 2, false);
    };
    
    // If you shipped a task, but it wasn&#39;t actually done, this undoes that
    AndBang.prototype.unshipTask = function (teamId, taskId, cb) {
        this._callApi('unshipTask', arguments, 2, false);
    };
    
    // Start watching a task.
    AndBang.prototype.watchTask = function (teamId, taskId, cb) {
        this._callApi('watchTask', arguments, 2, false);
    };
    
    // Stop watching a task.
    AndBang.prototype.unwatchTask = function (teamId, taskId, cb) {
        this._callApi('unwatchTask', arguments, 2, false);
    };
    
    // You&#39;re not going to do this task now.
    AndBang.prototype.laterTask = function (teamId, taskId, cb) {
        this._callApi('laterTask', arguments, 2, false);
    };
    
    // Moves the latered item back into your current list.
    AndBang.prototype.unlaterTask = function (teamId, taskId, cb) {
        this._callApi('unlaterTask', arguments, 2, false);
    };
    
    // Start working on a task. This will also stop working on other tasks you may have active.
    AndBang.prototype.startTask = function (teamId, taskId, cb) {
        this._callApi('startTask', arguments, 2, false);
    };
    
    // Stop working on a task.
    AndBang.prototype.stopTask = function (teamId, taskId, cb) {
        this._callApi('stopTask', arguments, 2, false);
    };
    
    // Move a task to a new position (zero-based) in your list. You can do this for stuff in your current and latered lists without having to specify which list. If you set a number higher than the length of the list, the task will just be moved to the end of the list.
    AndBang.prototype.setTaskPosition = function (teamId, taskId, newPosition, cb) {
        this._callApi('setTaskPosition', arguments, 3, false);
    };
    
    // Create a new task and add it to my list.
    AndBang.prototype.createTaskForMe = function (teamId, taskAttributes, cb) {
        this._callApi('createTaskForMe', arguments, 2, false);
    };
    
    // Create a new task and add it to your teammates&#39;s list
    AndBang.prototype.createTaskForTeammate = function (teamId, userId, taskAttributes, cb) {
        this._callApi('createTaskForTeammate', arguments, 3, false);
    };
    
    // Gets all current and latered tasks for team in the order they were created.
    AndBang.prototype.getAllTasks = function (teamId, cb) {
        this._callApi('getAllTasks', arguments, 1, false);
    };
    
    // Get tasks the team has shipped. Shows 100 most recent to start.
    AndBang.prototype.getTeamShippedTasks = function (teamId, cb) {
        this._callApi('getTeamShippedTasks', arguments, 1, false);
    };
    
    // Get all current tasks for a given team member, excluding those that have been latered or shipped.
    AndBang.prototype.getMemberTasks = function (teamId, userId, cb) {
        this._callApi('getMemberTasks', arguments, 2, false);
    };
    
    // Get all the tasks that have been deferred by (or for) this person on this team.
    AndBang.prototype.getMemberLateredTasks = function (teamId, userId, cb) {
        this._callApi('getMemberLateredTasks', arguments, 2, false);
    };
    
    // Get tasks this person has shipped.
    AndBang.prototype.getMemberShippedTasks = function (teamId, userId, historyAttributes, cb) {
        this._callApi('getMemberShippedTasks', arguments, 3, true);
    };
    
    // Get the tasks this person is watching.
    AndBang.prototype.getMemberWatchedTasks = function (teamId, userId, cb) {
        this._callApi('getMemberWatchedTasks', arguments, 2, false);
    };
    
    // Get the task this person is working on.
    AndBang.prototype.getMemberActiveTask = function (teamId, userId, cb) {
        this._callApi('getMemberActiveTask', arguments, 2, false);
    };
    
    // Get my current tasks.
    AndBang.prototype.getMyTasks = function (teamId, cb) {
        this._callApi('getMyTasks', arguments, 1, false);
    };
    
    // Get all tasks I&#39;ve latered on this team.
    AndBang.prototype.getMyLateredTasks = function (teamId, cb) {
        this._callApi('getMyLateredTasks', arguments, 1, false);
    };
    
    // Get tasks that I&#39;ve shipped recently.
    AndBang.prototype.getMyShippedTasks = function (teamId, historyAttributes, cb) {
        this._callApi('getMyShippedTasks', arguments, 2, true);
    };
    
    // Get the tasks that I&#39;m watching.
    AndBang.prototype.getMyWatchedTasks = function (teamId, cb) {
        this._callApi('getMyWatchedTasks', arguments, 1, false);
    };
    
    // Get the task that I&#39;m working on.
    AndBang.prototype.getMyActiveTask = function (teamId, cb) {
        this._callApi('getMyActiveTask', arguments, 1, false);
    };
    
    // Show what everyone on the team is working on
    AndBang.prototype.getTeamActiveTasks = function (teamId, cb) {
        this._callApi('getTeamActiveTasks', arguments, 1, false);
    };
    
    // Get a given member on the team.
    AndBang.prototype.getMember = function (teamId, userId, cb) {
        this._callApi('getMember', arguments, 2, false);
    };
    
    // Get members on the team.
    AndBang.prototype.getMembers = function (teamId, cb) {
        this._callApi('getMembers', arguments, 1, false);
    };
    
    // Save the ID of the last acknowledged notification, or &#39;latest&#39;
    AndBang.prototype.setLastReadNotification = function (teamId, lastReadNotificationId, cb) {
        this._callApi('setLastReadNotification', arguments, 2, false);
    };
    
    // Save the ID of the last acknowledged team chat, or &#39;latest&#39;
    AndBang.prototype.setLastReadTeamChat = function (teamId, lastReadChatID, cb) {
        this._callApi('setLastReadTeamChat', arguments, 2, false);
    };
    
    // Save the ID of the last acknowledged direct chat with another team member, or &#39;latest&#39;
    AndBang.prototype.setLastReadDirectChat = function (teamId, userId, lastReadChatID, cb) {
        this._callApi('setLastReadDirectChat', arguments, 3, false);
    };
    
    // Set the chat state for conversation (e.g composing, paused, inactive, active)
    AndBang.prototype.setDirectChatState = function (teamId, userId, chatState, cb) {
        this._callApi('setDirectChatState', arguments, 3, false);
    };
    
    // Resets your last interaction with a given team member to zero. This is useful for removing someone from lists that are built from or sorted by your recent interactions. This has no effect on anyone but you.
    AndBang.prototype.resetLastInteraction = function (teamId, userId, cb) {
        this._callApi('resetLastInteraction', arguments, 2, false);
    };
    
    // Get details about a single invitation
    AndBang.prototype.getInvite = function (teamId, inviteId, cb) {
        this._callApi('getInvite', arguments, 2, false);
    };
    
    // Get array of everybody who has been invited to the team
    AndBang.prototype.getInvites = function (teamId, cb) {
        this._callApi('getInvites', arguments, 1, false);
    };
    
    // Send a chat message.
    AndBang.prototype.sendChat = function (teamId, chatMessage, cb) {
        this._callApi('sendChat', arguments, 2, false);
    };
    
    // Send a direct chat message.
    AndBang.prototype.sendDirectChat = function (teamId, userId, chatMessage, cb) {
        this._callApi('sendDirectChat', arguments, 3, false);
    };
    
    // Retrieve chat history.
    AndBang.prototype.getChatHistory = function (teamId, historyAttributes, cb) {
        this._callApi('getChatHistory', arguments, 2, true);
    };
    
    // Retrieve direct chat history.
    AndBang.prototype.getDirectChatHistory = function (teamId, userId, historyAttributes, cb) {
        this._callApi('getDirectChatHistory', arguments, 3, true);
    };
    

    // attach to windor or export with commonJS
    if (typeof exports !== 'undefined') {
        module.exports = AndBang;
    } else {
        root.AndBang = AndBang;
    }

}).call(this);
