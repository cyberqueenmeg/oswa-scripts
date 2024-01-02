#!/bin/bash

# make directory for results
echo "Creating directory $1."
mkdir $1

# nmap scan
echo "Executing basic nmap scan"
nmap -p- -sV -sS -Pn -A $1 > $1/nmap
echo "Nmap basic scan complete"

# gobuster enum
echo "Running gobuster to find endpoints"
gobuster dir -u $1 -w /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt > $1/gobuster-end
echo "Endpoint discovery complete"

echo "Running gobuster to find subdomains"
sudo gobuster dir -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u http://$1 > $1/gobuster-sub
echo "Subdomain discovery complete"

#wfuzz enum
echo "Running wfuzz to find files"
wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/raft-large-files.txt --hc 301,404 "$1/FUZZ" > $1/file-enum
echo "File discovery complete"

# nmap vulners
echo "Running nmap vulners scan"
nmap -sV -Pn --script=vulners $1 > $1/nmap_vulners
echo "Nmap vulners scan complete"

# cewl generation
echo "Generating password list using cewl"
cewl -d 5 -w $1/cewl http://$1
echo "Cewl password generation complete"
