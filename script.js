document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for nav links
    const links = document.querySelectorAll('nav ul li a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Tutorial Modal
    const tutorialModal = document.getElementById('tutorial-modal');
    const tutorialContent = document.querySelector('.tutorial-content');
    const tutorialTitle = document.getElementById('tutorial-title');
    const tutorialDescription = document.getElementById('tutorial-description');
    const tutorialPrev = document.getElementById('tutorial-prev');
    const tutorialNext = document.getElementById('tutorial-next');
    const tutorialClose = document.getElementById('tutorial-close');
    const tutorialDontShow = document.getElementById('tutorial-dont-show');

    const tutorialSteps = [
        {
            id: 'nav-name',
            title: 'My Name',
            description: 'This is my name, Aryan Gupta, proudly displayed as the owner of this portfolio.'
        },
        {
            id: 'nav-home',
            title: 'Home',
            description: 'The Home link takes you to the landing page, featuring a cool 3D model animation.'
        },
        {
            id: 'nav-projects',
            title: 'Projects',
            description: 'Click Projects to view my featured works, like Project Genesis, with more to come.'
        },
        {
            id: 'nav-technical-skills',
            title: 'Technical Skills',
            description: 'This section highlights my technical abilities, such as front-end development and web design.'
        },
        {
            id: 'nav-non-technical-skills',
            title: 'Non-Technical Skills',
            description: 'Explore my non-technical skills, including languages and time management.'
        },
        {
            id: 'nav-about',
            title: 'About Me',
            description: 'Learn more about my background, interests, and passion for tech and gaming.'
        },
        {
            id: 'nav-contact',
            title: 'Contact',
            description: 'Use the Contact link to reach out via a form or my email address.'
        },
        {
            id: 'nav-theme-toggle',
            title: 'Theme Toggle',
            description: 'Pull the rope to switch between light and dark modes for a different look.'
        }
    ];

    let currentStep = 0;

    function showTutorialStep(stepIndex) {
        const step = tutorialSteps[stepIndex];
        tutorialTitle.textContent = step.title;
        tutorialDescription.textContent = step.description;

        // Remove previous highlight
        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));

        // Remove initial animation class after first step
        if (stepIndex > 0) {
            tutorialContent.classList.remove('initial');
        }

        // Highlight and position tutorial
        const targetElement = document.getElementById(step.id);
        if (targetElement) {
            targetElement.classList.add('highlight');
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Position tutorial box below navbar items to avoid text overlap
            const rect = targetElement.getBoundingClientRect();
            const offsetY = 10;
            const positionTop = rect.bottom + window.scrollY + offsetY;
            let positionLeft = rect.left + window.scrollX;

            tutorialContent.style.top = `${positionTop}px`;
            tutorialContent.style.left = `${positionLeft}px`;

            // Ensure it stays within viewport bounds
            const contentRect = tutorialContent.getBoundingClientRect();
            if (contentRect.right > window.innerWidth) {
                tutorialContent.style.left = `${window.innerWidth - contentRect.width - 10}px`;
            }
            if (contentRect.left < 0) {
                tutorialContent.style.left = '10px';
            }
        }

        // Button visibility and text for last step
        tutorialPrev.style.display = stepIndex === 0 ? 'none' : 'block';
        tutorialNext.style.display = stepIndex === tutorialSteps.length - 1 ? 'none' : 'block';
        tutorialClose.textContent = stepIndex === tutorialSteps.length - 1 ? 'Done' : 'Close';
    }

    function openTutorial() {
        tutorialContent.classList.add('initial');
        tutorialModal.classList.add('active');
        tutorialModal.setAttribute('aria-hidden', 'false');
        showTutorialStep(currentStep);
        document.body.style.overflow = 'hidden';
    }

    function closeTutorial() {
        tutorialContent.classList.remove('initial');
        tutorialModal.classList.remove('active');
        tutorialModal.setAttribute('aria-hidden', 'true');
        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        document.body.style.overflow = 'auto';
        currentStep = 0;
    }

    // Explore Now button triggers tutorial
    const exploreBtn = document.querySelector('.explore-btn');
    exploreBtn.addEventListener('click', () => {
        if (localStorage.getItem('hideTutorial') !== 'true') {
            openTutorial();
        } else {
            document.getElementById('projects').scrollIntoView({
                behavior: 'smooth'
            });
        }
    });

    // Tutorial navigation
    tutorialNext.addEventListener('click', () => {
        if (currentStep < tutorialSteps.length - 1) {
            currentStep++;
            showTutorialStep(currentStep);
        }
    });

    tutorialPrev.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showTutorialStep(currentStep);
        }
    });

    tutorialClose.addEventListener('click', closeTutorial);

    // Close modal on outside click
    tutorialModal.addEventListener('click', (e) => {
        if (e.target === tutorialModal) {
            closeTutorial();
        }
    });

    // Don’t show again
    tutorialDontShow.addEventListener('change', () => {
        localStorage.setItem('hideTutorial', tutorialDontShow.checked);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (tutorialModal.classList.contains('active')) {
            if (e.key === 'ArrowRight' && currentStep < tutorialSteps.length - 1) {
                currentStep++;
                showTutorialStep(currentStep);
            } else if (e.key === 'ArrowLeft' && currentStep > 0) {
                currentStep--;
                showTutorialStep(currentStep);
            } else if (e.key === 'Escape') {
                closeTutorial();
            }
        }
    });

    // Theme toggle with draggable SVG rope
    const themeString = document.getElementById('theme-string');
    const ropePath = document.getElementById('rope-path');
    const body = document.body;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let dragDistance = 0;
    const pullThreshold = 50;
    const maxStretch = 57;
    const ropeStartX = 10;
    const ropeStartY = 30;
    let currentX = ropeStartX;
    let currentY = ropeStartY;
    let velocityX = 0;
    let velocityY = 0;
    let animationFrameId = null;

    // Load saved theme
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
    }

    function updateRope(endX, endY) {
        const deltaX = endX - 10;
        const deltaY = endY - 0;
        let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        let limitedX = endX;
        let limitedY = endY;

        if (distance > maxStretch) {
            const scale = maxStretch / distance;
            limitedX = 10 + deltaX * scale;
            limitedY = deltaY * scale;
        }

        const controlX = 10 + (limitedX - 10) * 0.5;
        const controlY = limitedY * 0.5;

        ropePath.setAttribute('d', `M10 0 Q${controlX} ${controlY} ${limitedX} ${limitedY}`);

        const minX = Math.min(0, limitedX, controlX) - 5;
        const maxX = Math.max(20, limitedX, controlX) + 5;
        const minY = Math.min(0, limitedY, controlY) - 5;
        const maxY = Math.max(40, limitedY, controlY) + 5;
        themeString.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

        return { x: limitedX, y: limitedY };
    }

    function animateRubberBand() {
        if (isDragging) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        const k = 0.2;
        const damping = 0.85;
        const restX = ropeStartX;
        const restY = ropeStartY;

        const forceX = -k * (currentX - restX);
        const forceY = -k * (currentY - restY);
        velocityX = (velocityX + forceX) * damping;
        velocityY = (velocityY + forceY) * damping;
        currentX += velocityX;
        currentY += velocityY;

        updateRope(currentX, currentY);

        const distToRest = Math.sqrt((currentX - restX) ** 2 + (currentY - restY) ** 2);
        if (distToRest < 0.1 && Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) {
            currentX = restX;
            currentY = restY;
            updateRope(currentX, currentY);
            cancelAnimationFrame(animationFrameId);
        } else {
            animationFrameId = requestAnimationFrame(animateRubberBand);
        }
    }

    themeString.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        themeString.classList.add('dragging');
        ropePath.style.transition = 'none';
        cancelAnimationFrame(animationFrameId);
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            dragDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
            const newPos = updateRope(ropeStartX + deltaX / 5, ropeStartY + deltaY / 5);
            currentX = newPos.x;
            currentY = newPos.y;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            themeString.classList.remove('dragging');
            ropePath.style.transition = 'none';
            if (dragDistance > pullThreshold) {
                body.classList.toggle('light-mode');
                localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
            }
            dragDistance = 0;
            velocityX = 0;
            velocityY = 0;
            animationFrameId = requestAnimationFrame(animateRubberBand);
        }
    });

    themeString.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        themeString.classList.add('dragging');
        ropePath.style.transition = 'none';
        cancelAnimationFrame(animationFrameId);
        e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            dragDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
            const newPos = updateRope(ropeStartX + deltaX / 5, ropeStartY + deltaY / 5);
            currentX = newPos.x;
            currentY = newPos.y;
        }
    });

    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            themeString.classList.remove('dragging');
            ropePath.style.transition = 'none';
            if (dragDistance > pullThreshold) {
                body.classList.toggle('light-mode');
                localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
            }
            dragDistance = 0;
            velocityX = 0;
            velocityY = 0;
            animationFrameId = requestAnimationFrame(animateRubberBand);
        }
    });

    // Three.js code for 3D animation
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const material = new THREE.MeshBasicMaterial({ color: 0x00ccff, wireframe: true });

    // Define 3D models
    const models = [
        {
            name: 'Torus',
            geometry: new THREE.TorusGeometry(10, 3, 16, 100),
            scale: 1
        },
        {
            name: 'Cube',
            geometry: new THREE.BoxGeometry(12, 12, 12),
            scale: 1
        },
        {
            name: 'Sphere',
            geometry: new THREE.SphereGeometry(10, 32, 32),
            scale: 1
        },
        {
            name: 'Spaceship',
            geometry: (() => {
                const shape = new THREE.Shape();
                shape.moveTo(0, 15);
                shape.lineTo(5, 5);
                shape.lineTo(3, 0);
                shape.lineTo(-3, 0);
                shape.lineTo(-5, 5);
                shape.lineTo(0, 15);
                return new THREE.LatheGeometry(shape.getPoints(), 12);
            })(),
            scale: 0.7
        },
        {
            name: 'Pyramid',
            geometry: new THREE.ConeGeometry(10, 15, 4),
            scale: 1
        },
        {
            name: 'Dodecahedron',
            geometry: new THREE.DodecahedronGeometry(10),
            scale: 1
        },
        {
            name: 'Rocket',
            geometry: (() => {
                const shape = new THREE.Shape();
                shape.moveTo(0, 20);
                shape.quadraticCurveTo(5, 15, 3, 0);
                shape.lineTo(-3, 0);
                shape.quadraticCurveTo(-5, 15, 0, 20);
                return new THREE.LatheGeometry(shape.getPoints(), 12);
            })(),
            scale: 0.7
        },
        {
            name: 'Crystal',
            geometry: new THREE.IcosahedronGeometry(10),
            scale: 1
        }
    ];

    let currentModelIndex = 0;
    let currentMesh = new THREE.Mesh(models[currentModelIndex].geometry, material);
    currentMesh.scale.setScalar(models[currentModelIndex].scale);
    scene.add(currentMesh);

    camera.position.z = 30;

    // Animation states
    let isSwitching = false;
    let animationProgress = 0;
    let direction = 0; // 1 for right, -1 for left
    let nextMesh = null;

    function switchModel(newIndex, dir) {
        if (isSwitching || newIndex === currentModelIndex) {
            return;
        }

        isSwitching = true;
        direction = dir;
        animationProgress = 0;

        // Create new mesh
        nextMesh = new THREE.Mesh(models[newIndex].geometry, material);
        nextMesh.scale.setScalar(models[newIndex].scale);
        scene.add(nextMesh);

        // Initial positions
        currentMesh.position.x = 0;
        nextMesh.position.x = direction === 1 ? 50 : -50; // Start off-screen
    }

    // Arrow controls
    const leftArrow = document.getElementById('left-arrow');
    const rightArrow = document.getElementById('right-arrow');

    leftArrow.addEventListener('click', () => {
        const newIndex = (currentModelIndex - 1 + models.length) % models.length;
        switchModel(newIndex, -1);
    });

    rightArrow.addEventListener('click', () => {
        const newIndex = (currentModelIndex + 1) % models.length;
        switchModel(newIndex, 1);
    });

    function animate() {
        requestAnimationFrame(animate);

        // Handle model switching animation
        if (isSwitching) {
            animationProgress += 0.05; // Adjust speed of animation
            if (animationProgress >= 1) {
                // Animation complete
                scene.remove(currentMesh);
                currentMesh = nextMesh;
                nextMesh = null;
                currentModelIndex = (currentModelIndex + (direction === 1 ? 1 : -1) + models.length) % models.length;
                currentMesh.position.x = 0;
                isSwitching = false;
                animationProgress = 0;
            } else {
                // Animate positions
                currentMesh.position.x = direction * animationProgress * -50; // Move out
                if (nextMesh) {
                    nextMesh.position.x = direction * (1 - animationProgress) * 50; // Move in
                }
            }
        }

        // Rotate current model
        currentMesh.rotation.x += 0.01;
        currentMesh.rotation.y += 0.01;
        if (nextMesh) {
            nextMesh.rotation.x += 0.01;
            nextMesh.rotation.y += 0.01;
        }

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
