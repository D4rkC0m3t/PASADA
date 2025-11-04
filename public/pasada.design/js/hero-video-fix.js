// Hero Video Fix - Ensures video plays and is visible
(function() {
    'use strict';
    
    function initHeroVideo() {
        // Find the hero video element
        const videoContainer = document.querySelector('.header_lightbox-image.w-background-video');
        const video = document.querySelector('.header_lightbox-image video');
        
        if (!video || !videoContainer) {
            console.warn('Hero video element not found');
            return;
        }
        
        console.log('Hero video found, initializing...');
        
        // Make video visible
        videoContainer.style.opacity = '1';
        videoContainer.style.transition = 'opacity 0.5s ease-in';
        
        // Ensure video attributes are set
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        
        // Force play the video
        const playVideo = () => {
            video.play().then(() => {
                console.log('Hero video playing successfully');
            }).catch(err => {
                console.error('Error playing hero video:', err);
                // Retry after a short delay
                setTimeout(() => {
                    video.play().catch(e => console.error('Retry failed:', e));
                }, 500);
            });
        };
        
        // Try to play immediately
        playVideo();
        
        // Also play on user interaction (for browsers that block autoplay)
        const playOnInteraction = () => {
            playVideo();
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
            document.removeEventListener('scroll', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true });
        document.addEventListener('scroll', playOnInteraction, { once: true });
        
        // Intersection Observer for scroll-based playback
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (video.paused) {
                        playVideo();
                    }
                } else {
                    // Optionally pause when out of view to save resources
                    // video.pause();
                }
            });
        }, {
            threshold: 0.25 // Play when 25% visible
        });
        
        observer.observe(videoContainer);
        
        // Handle video errors
        video.addEventListener('error', (e) => {
            console.error('Hero video error:', e);
            // Show poster image as fallback
            if (videoContainer.dataset.posterUrl) {
                videoContainer.style.backgroundImage = `url("${videoContainer.dataset.posterUrl}")`;
                videoContainer.style.backgroundSize = 'cover';
                videoContainer.style.backgroundPosition = 'center';
            }
        });
        
        // Ensure video stays playing
        video.addEventListener('pause', () => {
            if (!video.ended) {
                setTimeout(() => {
                    if (video.paused && !video.ended) {
                        playVideo();
                    }
                }, 100);
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroVideo);
    } else {
        initHeroVideo();
    }
    
    // Also try after a short delay to ensure all scripts are loaded
    setTimeout(initHeroVideo, 500);
    setTimeout(initHeroVideo, 1000);
    
})();
