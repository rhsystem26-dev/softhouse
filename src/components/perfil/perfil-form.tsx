"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfileAction, updateEmailAction, uploadAvatarAction } from "@/lib/actions/profile";
import { Camera, Loader2, Mail, User, Phone } from "lucide-react";

interface PerfilFormProps {
  currentName: string;
  currentEmail: string;
  currentPhone: string;
  currentAvatarUrl: string | null;
}

export function PerfilForm({ currentName, currentEmail, currentPhone, currentAvatarUrl }: PerfilFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [emailSent, setEmailSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePending, startProfile] = useTransition();
  const [emailPending, startEmail] = useTransition();
  const [avatarPending, startAvatar] = useTransition();

  const initials = (currentName || currentEmail)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    startAvatar(async () => {
      const result = await uploadAvatarAction(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        setAvatarUrl(result.url ?? null);
        toast.success("Foto atualizada");
      }
    });
  }

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startProfile(async () => {
      const result = await updateProfileAction(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Perfil salvo");
      }
    });
  }

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startEmail(async () => {
      const result = await updateEmailAction(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        setEmailSent(true);
        toast.success("Confirmação enviada para o novo email");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Foto de perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={currentName} />}
                <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarPending}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {avatarPending
                  ? <Loader2 className="w-3 h-3 text-white animate-spin" />
                  : <Camera className="w-3 h-3 text-white" />
                }
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm text-slate-300">Clique no ícone para trocar a foto</p>
              <p className="text-xs text-slate-500 mt-0.5">JPEG, PNG ou WebP · Máx. 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nome e telefone */}
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Dados pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={currentName}
                placeholder="Seu nome"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Telefone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={currentPhone}
                placeholder="+55 11 99999-9999"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={profilePending} size="sm">
                {profilePending ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Salvando…</> : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email */}
      <Card className="bg-slate-900 border-slate-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" /> Endereço de email
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3">
              <p className="text-sm text-emerald-400">
                Link de confirmação enviado. Verifique a caixa de entrada do novo email para concluir a alteração.
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Novo email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={currentEmail}
                  placeholder="novo@email.com"
                  required
                />
                <p className="text-xs text-slate-500">
                  Um link de confirmação será enviado para o novo endereço.
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={emailPending} size="sm" variant="outline">
                  {emailPending ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Enviando…</> : "Alterar email"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
