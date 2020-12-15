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
                    <div class="overflow-auto" :style="fileStyle">
                        <ul class="list-group">
                            <li class="list-group-item" v-for="item in items" :key="item.name" v-on:click='handlefileclick(item)'>
                                {{ item.name }}
                                <span v-if='item.isFile'> - {{ item.size }} MB</span>
                                <span v-if='item.isFolder'>/</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="col-8">
                    <button v-if="type==VIDEO_TYPE" type="button" class="btn btn-primary btn-sm" v-on:click='randomplayone()'>One <i class="fas fa-random fa-lg"></i></button> | 
                    <button v-if="type==VIDEO_TYPE" type="button" class="btn btn-primary btn-sm" v-on:click='playallrandom()'>All <i class="fas fa-random fa-lg"></i></button>
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
            currentItem: -1
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
                this.playprevious();
               
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
        ready () { console.log('ready') },
        ended () {
            this.randomplay();
            console.log('ended') 
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
            if(this.type == VIDEO){
                if(this.playrandom){
                    this.randomplayone();
                } else {

                }
            }else{
                this.randomimage();
            }
            
        },
        playprevious(){
            if(this.type == VIDEO){
                if(this.playrandom){
                    this.randomplayone();
                } else {

                }
            }else{
                this.randomimage();
            }
        },
        randomimage(){
            // might have to load videos into source element
            const random = Math.floor(Math.random() * this.items.length);
            this.handlefileclick(this.items[random]);
        },
        randomplayone(){
            this.playrandom = true;
            this.autoplay = false;
            this.randomplay();
        },
        playallrandom(){
            this.playrandom = true;
            this.autoplay = true;
            this.randomplay();
        },
        playnext(){
            if (this.playall){
                this.randomplay();
            }
        },
        fullpath(filename) {
            // create full path
            //console.log(filename)
            return "file://" + this.folder + filename; 
        },
        loadfilesonenter(e){
             if (e.keyCode === 13) {
                this.loadfiles();
            } 
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
            for ( var f of files){
                var file = {}
                var stat = fs.statSync(dir + f)
                var size = Math.trunc(stat.size / 1048576)
                if (stat.isFile()){
                    if (this.type == VIDEO && (f.endsWith('mp4') || f.endsWith('webm'))){
                        file.name = f;
                        file.size = size;
                        file.isVideo = true;
                        file.isImage = false;
                        file.isFolder = false;
                        this.items.push(file)
                    } else if (this.type == IMAGE && (f.endsWith('gif') || f.endsWith('jpg') || f.endsWith('JPG') || f.endsWith('webp'))){
                        file.name = f;
                        file.size = size;
                        file.isVideo = false;
                        file.isImage = true;
                        file.isFolder = false;
                        this.items.push(file)
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
        randomplay(){
            // might have to load videos into source element
            const random = Math.floor(Math.random() * this.items.length);
            this.handlefileclick(this.items[random]);
            if(this.type == VIDEO){
                var vid = this.$refs.video;
                vid.load();
                if (this.playall){
                    vid.autoplay = true;
                } else {
                    vid.autoplay = false;
                }
                vid.play();
            }
        },
        handlefileclick(aItem){
            this.playall = false;
           
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
                    var vid = this.$refs.video;
                    vid.autoplay = false;
                    vid.load();
                    vid.play();
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