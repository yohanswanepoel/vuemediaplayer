<template>
    <div class="wrapper">
        
        
        <nav id="sidebar"  v-bind:class="{active: showSideBar}">
            <div>
                <input v-model="folder" placeholder="path" style="width: 100%;" v-on:blur="loadfiles()" v-on:keyup="loadfilesonenter">   
            </div>
            <div>
                    <input v-model="filter" placeholder="filter" style="width: 55%;" v-on:keyup="filterList">
                     | <button class="btn btn-outline-light btn-sm" v-bind:class="{ active: type == 1 }" v-on:click="showVideos()">Vid</button>
                     | <button class="btn btn-outline-light btn-sm" v-bind:class="{ active: type == 2 }"  v-on:click="showImages()">Img</button>
            </div>
            <div>
                <button type="button" class="btn btn-sm btn-outline-light" v-on:click="back()"><i class="fas fa-undo fa-lg"></i> Back</button>
                | <button type="button" class="btn btn-outline-light btn-sm" v-on:click='loadfiles_btn()'><i class="fas fa-sort fa-lg"></i> Reload</button>
                | <button  type="button" class="btn btn-outline-light btn-sm" v-on:click='playallrandom()'><i class="fas fa-random fa-lg"></i> Shuffle</button>
                | <button v-if='type == 2' type="button" class="btn btn-outline-light btn-sm" v-on:click='loop()'><i class="fas fa-lg" v-bind:class="{ 'fa-play': image_loop==false, 'fa-pause': image_loop }"></i> {{ image_loop_label }}</button>
            </div>
            <div id="fileContainer" class="overflow-auto" :style="fileStyle">
                <ul class="list-group">
                    <li v-bind:class="{ active: index == currentItem }" class="list-group-item" v-for="(item, index) in items" :key="item.name" v-on:click='handlefileclick(item, index)'>
                        {{ item.name }}
                        <span v-if='item.isFile'> - {{ item.size }} MB</span>
                        <span v-if='item.isFolder'>/</span>
                    </li>
                </ul>
            </div>
        </nav>
        <div id="content" class="container-fluid">
            <div style="padding-bottom: 5px; padding-top:2px;">
                <div style="float: left;">
                    <button type="button" id="sidebarCollapse" v-on:click="toggleSideBar()" class="btn btn-outline-light btn-sm">
                        <i class="fas fa-align-left"></i> Files
                    </button>
                </div>
                
                <div style="text-align: center; width:100%;">
                Now Playing: {{ file }}
                </div>
            </div>
            <video v-if="type==VIDEO_TYPE" class="media" width="100%" :height="mediaHeight" controls ref="video" @ready="ready"
                @ended="ended"
                @playing="playing"
                @paused="paused"
                @buffering="buffering"
                @qued="qued">
                <source v-bind:src="fullpath(file)" type="video/mp4" >
            </video>
            <img v-if="type==IMAGE_TYPE" :height="mediaHeight" style="width:100%; object-fit: contain" v-bind:src="fullpath(file)">    
        </div>
    </div>
</template>

<script>
import { remote } from 'electron';
const fs = require('fs');
const path = require('path');
const os = require('os')
const electron = require('electron');
const VIDEO = 1;
const IMAGE = 2;

export default {
    name: 'PlayVideo',
    data: function(){
        return {
            folder: '',
            file: '',
            items: [],
            playlist: [],
            playall: false,
            playrandom: false,
            type: VIDEO,
            VIDEO_TYPE: VIDEO, 
            IMAGE_TYPE: IMAGE,
            windowHeight: window.innerHeight,
            mediaHeight: 700,
            fileStyle: "width: 100%; height:700px",
            currentItem: -1,
            canvas_multiplier: .95,
            file_browse_multiplier: .90,
            filter: '',
            showSideBar: false,
            image_loop: false,
            image_loop_label: "Loop",
            loop_icon: "fa-play",
            loop_variable: null
        }
    },
    created(){
        this.folder = this.normaliseFolder(process.cwd());
        this.folder = os.homedir();
        //console.log("Add listeners");
        this.loadfiles();
        //folder = electron.remote.app.getPath("exe");
        window.addEventListener('keydown', (e) => {
            //console.log("Pressed: " + e.key);
            if (e.key == 'ArrowRight') {
                
            }
            else if (e.key == 'ArrowLeft') {
                
            }
            else if (e.key == 'ArrowUp') {
                this.playprevious();
                
            }
            else if (e.key == 'ArrowDown') {
                this.playnext();
               
            }
        });


        this.mediaHeight = parseInt(this.windowHeight * this.canvas_multiplier);
        this.fileStyle = "width: 100%; height:" + parseInt(this.windowHeight * this.file_browse_multiplier) + "px";
        
    },
    watch: {
        windowHeight(newHeight, oldHeight) {
        //console.log(`it changed to ${newHeight} from ${oldHeight}`);
        }
    },
    mounted() {
        this.$nextTick(() => {
        window.addEventListener('resize', this.onResize);
        })
    },

    beforeDestroy() { 
        window.removeEventListener('resize', this.onResize); 
    },
    methods: {
        toggleSideBar(){ 
            this.showSideBar = !this.showSideBar;
        },
        onResize() {
            this.windowHeight = window.innerHeight
            this.mediaHeight = parseInt(this.windowHeight * this.canvas_multiplier);
            this.fileStyle = "width: 100%; height:" + parseInt(this.windowHeight * this.file_browse_multiplier) + "px";
            console.log(this.fileStyle);
        },
        showVideos() {
            this.type = VIDEO;
            this.loadfiles();
        },
        showImages(){
            this.type = IMAGE;
            this.loadfiles();
        },
        filterList(){
            this.loadfiles();
            var tmpArr = [];
            var file = {};
            for (let i = 0; i < this.items.length; i++) {
                if (this.items[i].name.toUpperCase().indexOf(this.filter.toUpperCase()) > -1){
                    file = this.items[i];
                    tmpArr.push(file);
                }
            }
            this.items = []
            this.items = tmpArr;
            
        },
        ready () { console.log('ready') },
        ended () {
            this.playnext(); 
            },
        playing () { console.log('playing') },
        paused () { console.log('paused') },
        buffering () { console.log('buffering') },
        qued () { console.log('qued') },
        back(){
            var folder = this.folder;
            folder = folder.substring(0,folder.lastIndexOf('/'));
            folder = folder.substring(0,folder.lastIndexOf('/'));
            this.folder = folder + '/';
            this.loadfiles(); 
        },
        normaliseFolder(folder){
            if (folder.endsWith("/") == false) {
                folder = folder + "/";
            }
            return folder;
        },
        loop(){
            this.image_loop = !this.image_loop;
            this.image_loop ? this.image_loop_label="Pause" : this.image_loop_label="Loop";
            if (!this.image_loop_label){
                clearTimeout(this.loop_variable);
            } else {
                this.playnext();
            }   
        },
        playnext(){
            this.scrollToSelect(this.currentItem - 1);
            if (this.currentItem == (this.items.length - 1)){
                this.handlefileclick(this.items[0], 0);
            } else {
                this.handlefileclick(this.items[this.currentItem + 1], this.currentItem + 1);
            }
        },
        playprevious(){
            this.scrollToSelect(this.currentItem - 1);
            if (this.currentItem == 0){
                this.handlefileclick(this.items[this.items.length - 1], this.items.length - 1);
            } else {
                this.handlefileclick(this.items[this.currentItem - 1], this.currentItem - 1);
            }
        },
        scrollToSelect(index){
            var container = this.$el.querySelector("#fileContainer");
            //container.scrollTop = container.scrollHeight;
            container.scrollTop = (49 * index) - 49;
        },
        randomimage(){
            // might have to load videos into source element
            const random = Math.floor(Math.random() * this.items.length);
            this.handlefileclick(this.items[random], random);
        },
        playallrandom(){
            var tmpArr = this.items;
            for (let i = tmpArr.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
                // we use "destructuring assignment" syntax to achieve that
                [tmpArr[i], tmpArr[j]] = [tmpArr[j], tmpArr[i]];
            }
            this.items = []
            this.items = tmpArr;
        },
        fullpath(filename) {
            // create full path
            //console.log(filename)
            return "file://" + this.folder + filename; 
        },
        loadfilesonenter(e){
             if (e.keyCode === 13) {
                this.loadfiles_btn();
            } 
        },
        loadfiles_btn(){
            this.filter = '';
            this.loadfiles();
        },
        loadfiles(){
            this.folder = this.normaliseFolder(this.folder);
            this.items = [];
            var dir = this.folder;

            var files = fs.readdirSync(dir);
            files.sort(function(a, b) {
                        return fs.statSync(dir + b).mtime.getTime() - 
                                fs.statSync(dir + a).mtime.getTime();
                    });
            var counter = 0;
            for ( var f of files){
                var file = {}
                var stat = fs.statSync(dir + f)
                var size = Math.trunc(stat.size / 1048576)
                var f_upper = f.toUpperCase()
                if (stat.isFile()){
                    if (this.type == VIDEO && (f_upper.endsWith('MP4') || f_upper.endsWith('WEBM') || f_upper.endsWith('MOV'))){
                        file.order = counter;
                        file.name = f;
                        file.size = size;
                        file.isVideo = true;
                        file.isImage = false;
                        file.isFolder = false;
                        this.items.push(file)
                        counter ++;
                    } else if (this.type == IMAGE && (f_upper.endsWith('GIF') || f_upper.endsWith('JPG') || f_upper.endsWith('JPEG') || f_upper.endsWith('WEBP'))){
                        file.order = counter;
                        file.name = f;
                        file.size = size;
                        file.isVideo = false;
                        file.isImage = true;
                        file.isFolder = false;
                        this.items.push(file);
                        counter ++;
                    }
                }
                if (stat.isDirectory()){
                    file.name = f;
                    file.size = '<Folder>';
                    file.isFolder = true;
                    this.items.push(file);
                }
            }
        },
        handlefileclick(aItem, anIndex){
            if (typeof aItem !== 'undefined'){
                if (aItem.isFolder) {
                    this.folder = this.folder + aItem.name + "/";
                    this.loadfiles();
                }else{
                    if (aItem.isImage){
                        this.file = aItem.name;
                        this.currentItem = anIndex;
                        if (this.image_loop){
                            this.loop_variable = setTimeout(this.playnext, 2000)
                        }
                    }
                    if (aItem.isVideo) {
                        this.file = aItem.name;
                        //Force video load.
                        this.playlist = [];
                        this.playlist.push(aItem);
                        this.currentItem = anIndex;
                        var vid = this.$refs.video;
                        //vid.autoplay = false;
                        vid.load();
                        vid.play();
                        //this.showSideBar = false;
                    }
                }
            }
            
        }
    },
    computed: {
        filetoload(file) {
            return "file://" + this.folder + file; 
        }
  }, 

}
</script>