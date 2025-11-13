'use client';

import { useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const avatarPlaceholder = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.currentUser && displayName !== user?.displayName) {
      setIsSaving(true);
      try {
        await updateProfile(auth.currentUser, { displayName });
        toast({
          title: 'Success',
          description: 'Your profile has been updated.',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  const getAvatar = () => {
    if (user?.photoURL) {
      return {
        imageUrl: user.photoURL,
        description: user.displayName || 'User avatar',
        imageHint: 'person portrait'
      }
    }
    return avatarPlaceholder;
  }
  
  const avatar = getAvatar();

  return (
    <div className="flex-1 space-y-4">
      <h1 className="text-lg font-semibold md:text-2xl">User Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>View and update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center space-x-4">
               {avatar && (
                  <Image
                    src={avatar.imageUrl}
                    width={80}
                    height={80}
                    alt={avatar.description}
                    className="rounded-full"
                    data-ai-hint={avatar.imageHint}
                  />
                )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
