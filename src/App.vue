<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Media Player</router-link> 
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
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
    background: #c4c4c4;
    color: rgb(0, 0, 0);
    transition: all 0.3s;
}
#sidebar.active {
    margin-left: 0;
}
.list-group-item.active {
    background: #8b8b8b;
}


</style>

