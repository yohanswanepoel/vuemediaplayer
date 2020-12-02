<template>
    <div>
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">
                    <button type="button" class="btn btn-sm btn-primary" v-on:click="back()">Back</button>
                    <input v-model="folder" style="width: 80%;" v-on:blur="loadfiles()" v-on:keyup="loadfilesonenter">   
                </div>
            </div>
            <div class="row">
                <div class="col-4">
                    <div class="overflow-auto" style="width: 100%; height:700px">
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
                    <button type="button" class="btn btn-primary btn-sm" v-on:click='randomplayone()'>One <i class="fas fa-random fa-lg"></i></button> | 
                    <button type="button" class="btn btn-primary btn-sm" v-on:click='playallrandom()'>All <i class="fas fa-random fa-lg"></i></button>
                    <br>
                    <video class="media" width="1000" height="700" controls ref="video" @ready="ready"
                        @ended="ended"
                        @playing="playing"
                        @paused="paused"
                        @buffering="buffering"
                        @qued="qued">
                        <source v-bind:src="fullpath(file)" type="video/mp4" >
                    </video>
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
        }
    },
    created(){
        this.folder = this.normaliseFolder(process.cwd());
        this.folder = os.homedir();
        //console.log(electron);
        this.loadfiles();
        //folder = electron.remote.app.getPath("exe");
        window.addEventListener('keydown', (e) => {
            if (e.key == 'ArrowRight') {
                
            }
            else if (e.key == 'ArrowLeft') {
                
            }
            else if (e.key == 'ArrowUp') {
                if(this.playrandom){
                    this.randomplayone();
                } else {

                }
            }
            else if (e.key == 'ArrowDown') {
               if(this.playrandom){
                    this.randomplayone();
                } else {

                }
            }
        });
    },
    methods: {
        
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
                if (stat.isFile() && f.endsWith('mp4')){
                    file.name = f;
                    file.size = size;
                    file.isVideo = true;
                    file.isFolder = false;
                    this.items.push(file)
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
            var vid = this.$refs.video;
            vid.load();
            if (this.playall){
                vid.autoplay = true;
            } else {
                vid.autoplay = false;
            }
            vid.play();
        },
        handlefileclick(aItem){
            this.playall = false;
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
            if (aItem.isFolder) {
                this.folder = this.folder + aItem.name + "/";
                this.loadfiles();
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