<template>
    <div style="100%">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">
                    <button class="btn btn-outline-primary btn-sm" v-on:click="showVideos()">Videos</button> | <button class="btn btn-outline-primary btn-sm"  v-on:click="showImages()">Images</button>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <button type="button" class="btn btn-sm btn-primary" v-on:click="back()">Back</button>
                    <input v-model="folder" style="width: 80%;" v-on:blur="loadfiles()" v-on:keyup="loadfilesonenter">   
                </div>
            </div>
            <div class="row">
                <div class="col-4">
                    <div id="fileContainer" class="overflow-auto" :style="fileStyle">
                        <ul class="list-group">
                            <li v-bind:class="{ active: index == currentItem }" class="list-group-item" v-for="(item, index) in items" :key="item.name" v-on:click='handlefileclick(item, index)'>
                                {{ item.name }}
                                <span v-if='item.isFile'> - {{ item.size }} MB</span>
                                <span v-if='item.isFolder'>/</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="col-8">
                    <span>Filter: </span><input v-model="filter" v-on:keyup="filterList">
                    | 
                    <button v-if="type==VIDEO_TYPE" type="button" class="btn btn-primary btn-sm" v-on:click='playallrandom()'>Randomize <i class="fas fa-random fa-lg"></i></button>
                    | 
                   <button v-if="type==VIDEO_TYPE" type="button" class="btn btn-primary btn-sm" v-on:click='loadfiles_btn()'>Reload Files <i class="fas fa-sort fa-lg"></i></button>
                    <br>
                    <video v-if="type==VIDEO_TYPE" class="media" width="1000" :height="mediaHeight" controls ref="video" @ready="ready"
                        @ended="ended"
                        @playing="playing"
                        @paused="paused"
                        @buffering="buffering"
                        @qued="qued">
                        <source v-bind:src="fullpath(file)" type="video/mp4" >
                    </video>
                    <img v-if="type==IMAGE_TYPE" :height="mediaHeight" style="width:100%; object-fit: contain" v-bind:src="fullpath(file)"></img>
                    <br>
                    {{ file }}
                <!-- Content here -->
                </div>
            </div>
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
            filter: ''
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
        onResize() {
            this.windowHeight = window.innerHeight
            this.mediaHeight = parseInt(this.windowHeight * .8);
            this.fileStyle = "width: 100%; height:" + parseInt(this.windowHeight * .8) + "px";
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
        playnext(){
            this.scrollToSelect(this.currentItem - 1);
            if (this.currentItem == (this.items.length - 1)){
                this.handlefileclick(this.items[nextTrack], nextTrack);
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
                if (stat.isFile()){
                    if (this.type == VIDEO && (f.endsWith('mp4') || f.endsWith('webm'))){
                        file.order = counter;
                        file.name = f;
                        file.size = size;
                        file.isVideo = true;
                        file.isImage = false;
                        file.isFolder = false;
                        this.items.push(file)
                        counter ++;
                    } else if (this.type == IMAGE && (f.endsWith('gif') || f.endsWith('jpg') || f.endsWith('JPG') || f.endsWith('webp'))){
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