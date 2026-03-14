//! public/js/home/mouseTrailAndFollower.js

/**
 * Home Mouse Trail and Cursor Follower
 *
 * Adds two visual effects to the homepage overlay:
 * 1. A small cursor follower using the theme primary color
 * 2. Tiny fading dots that trail behind mouse movement
 *
 * Notes:
 * - This script is intended to be loaded with `defer`
 * - Effects are disabled when the user prefers reduced motion
 * - Effects are disabled on coarse pointers / touch-first devices
 */

const trailLayer = document.getElementById('home-mouse-trail');
const cursorFollower = document.getElementById('cursor-follower');

if (trailLayer && cursorFollower) {
	const prefersReducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)',
	).matches;

	const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
	const canHover = window.matchMedia('(hover: hover)').matches;

	if (!prefersReducedMotion && hasFinePointer && canHover) {
		let lastDotTime = 0;
		let lastDotX = -9999;
		let lastDotY = -9999;

		let pointerX = window.innerWidth / 2;
		let pointerY = window.innerHeight / 2;
		let followerX = pointerX;
		let followerY = pointerY;

		let isPointerActive = false;
		let animationFrameId = null;

		const DOT_INTERVAL_MS = 24;
		const DOT_MIN_DISTANCE = 8;
		const FOLLOWER_EASING = 0.2;

		/**
		 * Create a fading trail dot at the given viewport position.
		 *
		 * @param {number} x - Horizontal viewport coordinate
		 * @param {number} y - Vertical viewport coordinate
		 * @returns {void}
		 */
		function createDot(x, y) {
			const dot = document.createElement('span');
			dot.className = 'mouse-dot';
			dot.style.left = `${x}px`;
			dot.style.top = `${y}px`;

			trailLayer.appendChild(dot);

			dot.addEventListener(
				'animationend',
				() => {
					dot.remove();
				},
				{ once: true },
			);
		}

		/**
		 * Update the cursor follower position with easing for a smoother feel.
		 *
		 * @returns {void}
		 */
		function renderFollower() {
			followerX += (pointerX - followerX) * FOLLOWER_EASING;
			followerY += (pointerY - followerY) * FOLLOWER_EASING;

			cursorFollower.style.left = `${followerX}px`;
			cursorFollower.style.top = `${followerY}px`;

			if (
				Math.abs(pointerX - followerX) > 0.1 ||
				Math.abs(pointerY - followerY) > 0.1
			) {
				animationFrameId = window.requestAnimationFrame(renderFollower);
			} else {
				animationFrameId = null;
			}
		}

		/**
		 * Ensure the follower animation loop is running.
		 *
		 * @returns {void}
		 */
		function startFollowerLoop() {
			if (animationFrameId !== null) return;
			animationFrameId = window.requestAnimationFrame(renderFollower);
		}

		/**
		 * Handle mouse movement by updating the target pointer position
		 * and spawning trail dots at a controlled rate.
		 *
		 * @param {MouseEvent} event - Mouse move event
		 * @returns {void}
		 */
		function handleMouseMove(event) {
			const now = performance.now();
			const x = event.clientX;
			const y = event.clientY;

			pointerX = x;
			pointerY = y;

			if (!isPointerActive) {
				isPointerActive = true;
				cursorFollower.hidden = false;
				followerX = x;
				followerY = y;
			}

			startFollowerLoop();

			if (now - lastDotTime < DOT_INTERVAL_MS) return;

			const dx = x - lastDotX;
			const dy = y - lastDotY;
			const distance = Math.hypot(dx, dy);

			if (distance < DOT_MIN_DISTANCE) return;

			lastDotTime = now;
			lastDotX = x;
			lastDotY = y;

			createDot(x, y);
		}

		/**
		 * Show a larger follower state when hovering interactive elements.
		 *
		 * @param {Event} event - Pointer event
		 * @returns {void}
		 */
		function handlePointerOver(event) {
			const interactiveElement = event.target.closest(
				'a, button, [role="button"], input, textarea, select, label',
			);

			cursorFollower.classList.toggle(
				'is-hovering',
				Boolean(interactiveElement),
			);
		}

		/**
		 * Hide the follower when the pointer leaves the document.
		 *
		 * @returns {void}
		 */
		function handleMouseLeave() {
			isPointerActive = false;
			cursorFollower.hidden = true;
			cursorFollower.classList.remove('is-hovering');
		}

		// Initial state
		cursorFollower.hidden = true;

		// Pointer tracking
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseover', handlePointerOver);
		document.addEventListener('mouseleave', handleMouseLeave);
		window.addEventListener('blur', handleMouseLeave);
	}
}
