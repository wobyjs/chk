#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to check if a command exists
function commandExists(command) {
    try {
        execSync(`where ${command}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

// Function to detect the most commonly used package manager
function detectPackageManager() {
    // Check for pnpm first (as it's the preferred package manager for this project)
    if (commandExists('pnpm')) {
        return 'pnpm';
    }

    // Check for yarn
    if (commandExists('yarn')) {
        return 'yarn';
    }

    // Check for npm
    if (commandExists('npm')) {
        return 'npm';
    }

    // Default to pnpm if none found
    return 'pnpm';
}

// Function to install tsx using the detected package manager
function installTsx(packageManager) {
    console.log(`Installing tsx using ${packageManager}...`);

    try {
        switch (packageManager) {
            case 'pnpm':
                execSync('pnpm add -g tsx', { stdio: 'inherit' });
                break;
            case 'yarn':
                execSync('yarn global add tsx', { stdio: 'inherit' });
                break;
            case 'npm':
                execSync('npm install -g tsx', { stdio: 'inherit' });
                break;
            default:
                throw new Error(`Unsupported package manager: ${packageManager}`);
        }

        console.log('tsx installed successfully!');
    } catch (error) {
        console.error(`Failed to install tsx using ${packageManager}:`, error.message);
        process.exit(1);
    }
}

// Main execution
function main() {
    const packageManager = detectPackageManager();
    installTsx(packageManager);
}

main();