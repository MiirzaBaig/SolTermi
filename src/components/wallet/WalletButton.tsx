"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/Button";
import { formatShortAddress } from "@/lib/formatters";
import { Wallet, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";

export function WalletButton({ className }: { className?: string }) {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!connected || !publicKey) {
    return (
      <Button onClick={() => setVisible(true)} variant="primary" size="sm" className={className}>
        <Wallet className="h-4 w-4 mr-1.5" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button variant="secondary" size="sm" className={className}>
          {formatShortAddress(publicKey.toBase58())}
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          className="min-w-[220px] border-3 border-border bg-panel-bg p-3 shadow-brutal z-[100]"
          sideOffset={8}
        >
          <div className="px-2 py-2 text-xs text-text-secondary break-all border-b-2 border-border mb-2">
            {publicKey.toBase58()}
          </div>
          <Dropdown.Item
            className="flex items-center gap-2 px-2 py-2 text-sm outline-none hover:bg-accent/20 cursor-pointer border-b border-border/50"
            onSelect={handleCopy}
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy address"}
          </Dropdown.Item>
          <Dropdown.Item
            className="flex items-center gap-2 px-2 py-2 text-sm outline-none hover:bg-accent/20 cursor-pointer border-b border-border/50"
            onSelect={() => window.open(`https://solscan.io/account/${publicKey.toBase58()}`, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            View on Solscan
          </Dropdown.Item>
          <Dropdown.Separator className="h-0.5 bg-border my-1" />
          <Dropdown.Item
            className="flex items-center gap-2 px-2 py-2 text-sm text-loss outline-none hover:bg-loss/20 cursor-pointer"
            onSelect={() => disconnect()}
          >
            Disconnect
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
