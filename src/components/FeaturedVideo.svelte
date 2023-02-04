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
<span class="next-button fake-link" on:click={changeVideo} on:keypress={changeVideo} tabindex="0"
    >Next featured video</span
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
<span class="title text-shadow">{title}</span><br />
<span class="subtitle text-shadow">{subtitle}</span><br />
<p class="description text-shadow">{description}</p>

<style lang="scss">
    .next-button {
        padding: 0.25em;
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
</style>
