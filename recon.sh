#!/bin/bash

# make directory for results
echo "Creating directory $1."
mkdir $1

# nmap scan
echo "Executing basic nmap scan"
nmap -sV -Pn $1 > $1/nmap
echo "Nmap basic scan complete"

# gobuster enum
echo "Running gobuster to find directories"
sudo gobuster dir -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u http://$1 > $1/gobuster
echo "Directory discovery complete"

# nmap vulners
echo "Running nmap vulners scan"
nmap -sV -Pn --script=vulners $1 > $1/nmap_vulners
echo "Nmap vulners scan complete"

# cewl generation
echo "Generating password list using cewl"
cewl -d 5 -w $1/cewl http://$1
echo "Cewl password generation complete"
