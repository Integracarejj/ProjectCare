// apps/api/src/db/seed/scripts/extend-tasks.js

const fs = require("fs");
const path = require("path");

const tasksPath = path.join(__dirname, "..", "tasks.json");

const statuses = ["Not Started", "Backlog", "In Progress", "Blocked", "Complete"];
const priorities = ["Low", "Medium", "High"];
const resources = ["Product Manager", "Project Manager", "Backend Engineer", "Frontend Engineer", "QA Engineer", "UX Designer", "DevOps Engineer", "Business Analyst"];
const phaseNames = [
    "Project Initiation", "Discovery", "Requirements", "Architecture", "UX Design",
    "Technical Design", "Backend Development", "Frontend Development", "Integration",
    "Testing", "UAT", "Deployment", "Training", "Launch", "Post Launch Support"
];

function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function isoDate(date) { return date.toISOString().split("T")[0]; }
function isoDateTime(date) { return date.toISOString(); }

function generateTasks() {
    let tasks = [];
    let taskId = 1;
    let order = 1;
    let currentDate = new Date("2026-01-01");

    const createdTaskIds = []; // For dependencies

    phaseNames.forEach((phase, phaseIndex) => {

        // --- Create summary task ---
        const summaryId = `task-${taskId++}`;
        const summaryStart = currentDate;
        const summaryFinish = addDays(summaryStart, randomInt(8, 12));

        const summaryTask = {
            id: summaryId,
            projectId: "proj-alpha",
            parentId: null,
            wbs: `${phaseIndex + 1}`,
            title: phase,
            status: random(statuses),
            type: "summary",
            priority: random(priorities),
            resource: random(resources),
            percentComplete: 0, // will compute after subtasks
            startDate: isoDate(summaryStart),
            finishDate: isoDate(summaryFinish),
            duration: Math.ceil((summaryFinish - summaryStart) / (1000 * 60 * 60 * 24)) + 1,
            dependencies: [], // summaries usually have none
            order: order++,
            createdAt: isoDateTime(summaryStart)
        };

        tasks.push(summaryTask);
        const subtaskCount = 4 + randomInt(0, 4); // 4-8 subtasks

        const subtaskIds = [];

        // --- Create subtasks ---
        for (let i = 1; i <= subtaskCount; i++) {
            const start = addDays(summaryStart, i);
            const finish = addDays(start, randomInt(1, 5));

            const task = {
                id: `task-${taskId++}`,
                projectId: "proj-alpha",
                parentId: summaryId,
                wbs: `${phaseIndex + 1}.${i}`,
                title: `${phase} Task ${i}`,
                status: random(statuses),
                type: "task",
                priority: random(priorities),
                resource: random(resources),
                percentComplete: randomInt(0, 100),
                startDate: isoDate(start),
                finishDate: isoDate(finish),
                duration: Math.ceil((finish - start) / (1000 * 60 * 60 * 24)) + 1,
                dependencies: createdTaskIds.length > 0 ? [random(createdTaskIds)] : [],
                order: order++,
                createdAt: isoDateTime(start)
            };

            tasks.push(task);
            subtaskIds.push(task.id);
            createdTaskIds.push(task.id);
        }

        // --- Update summary percentComplete as average of subtasks ---
        const avgPercent = Math.floor(subtaskIds.reduce((sum, id) => sum + tasks.find(t => t.id === id).percentComplete, 0) / subtaskIds.length);
        summaryTask.percentComplete = avgPercent;

        // Update summary duration if needed
        const earliestStart = Math.min(...subtaskIds.map(id => new Date(tasks.find(t => t.id === id).startDate)));
        const latestFinish = Math.max(...subtaskIds.map(id => new Date(tasks.find(t => t.id === id).finishDate)));
        summaryTask.startDate = isoDate(new Date(earliestStart));
        summaryTask.finishDate = isoDate(new Date(latestFinish));
        summaryTask.duration = Math.ceil((latestFinish - earliestStart) / (1000 * 60 * 60 * 24)) + 1;

        createdTaskIds.push(summaryId);

        // Move currentDate forward
        currentDate = addDays(summaryFinish, 2);
    });

    return tasks;
}

const tasks = generateTasks();

fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));

console.log(`Generated ${tasks.length} tasks with full columns`);