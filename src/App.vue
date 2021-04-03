<template>
  <div id="app">
    <!--div id="nav">
      <router-link to="/">Media Player</router-link> 
    </div-->
    <router-view/>
  </div>
</template>

<style>

body {
  background: #2d2d2d;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #ededed;
}

html, body, #app, section.section {
  height: 100%;
}

#nav {
  padding: 20px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.wrapper {
    display: flex;
    width: 100%;
    align-items: stretch;
}
#sidebar {
    min-width: 500px;
    max-width: 500px;
    min-height: 88vh;
    margin-left: -500px;
      /* don't forget to add all the previously mentioned styles here too */
    background: #353535;
    color: rgb(0, 0, 0);
    transition: all 0.3s;
}
#sidebar.active {
    margin-left: 0;
}
.list-group-item.active {
    background: #484848;
}

.list-group-item {
  background: #636363;
  color: #efefef; 
}

input {
  background: #bdbdbd;
  border: none;
}


</style>

