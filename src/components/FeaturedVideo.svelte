<script lang="ts">
   import _featuredVideo from '../data/featuredVideo.json';
   interface FeaturedVideo {
      title: string;
      subtitle: string;
      description: string;
      src: string;
   }
   const featuredVideo = _featuredVideo as FeaturedVideo[];

   let index = Math.floor(Math.random() * featuredVideo.length);
   let title = featuredVideo[index].title,
      subtitle = featuredVideo[index].subtitle,
      description = featuredVideo[index].description,
      src = featuredVideo[index].src;

   function changeVideo() {
      index = ++index % featuredVideo.length;

      title = featuredVideo[index].title;
      subtitle = featuredVideo[index].subtitle;
      description = featuredVideo[index].description;
      src = featuredVideo[index].src;
   }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<button
   class="next-button fake-link text-shadow"
   on:click={changeVideo}
   on:keypress={changeVideo}
   tabindex="0">Next featured video</button
>
<div class="video-container">
   <iframe
      class="video-iframe"
      {src}
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      loading="lazy"
   />
</div>
<div class="text-container">
   <span class="title text-shadow">{title}</span><br />
   <span class="subtitle text-shadow">{subtitle}</span><br />
   <p class="description text-shadow">{description}</p>
</div>

<style lang="scss">
   @use '../styles/_var' as *;
   .next-button {
      background: $background-translucent;
      border: 0;
      border-top-right-radius: 5px;
      border-top-left-radius: 5px;
      font-size: 1rem;
      padding: 0.25em 0.5em;
   }
   .title {
      font-size: 1.75rem;
      color: white;
   }
   .subtitle {
      font-size: 1.375rem;
      color: white;
   }
   .description {
      font-size: 1rem;
      color: white;
   }
   .text-container {
      background: $background-translucent;
      padding: 0.125em 0.5em;
      border-bottom-right-radius: 0.25em;
      border-bottom-left-radius: 0.25em;
   }
</style>
