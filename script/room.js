document.addEventListener('DOMContentLoaded', function() {
    const floorButtons = document.querySelectorAll('.floor-btn');
    const floorPlans = document.querySelectorAll('.floor-plan');

    floorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and floor plans
            floorButtons.forEach(btn => btn.classList.remove('active'));
            floorPlans.forEach(plan => plan.classList.remove('active'));

            // Add active class to clicked button and corresponding floor plan
            button.classList.add('active');
            const floor = button.getAttribute('data-floor');
            document.querySelector(`.floor-plan[data-floor="${floor}"]`).classList.add('active');
        });
    });
});