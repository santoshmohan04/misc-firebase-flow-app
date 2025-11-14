'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { uploadProfileImage, listUserFiles } from '@/firebase/storage';
import { Loader2, FileImage } from 'lucide-react';
import type { StorageReference } from 'firebase/storage';

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<StorageReference[]>([]);
  const [isListingFiles, setIsListingFiles] = useState(true);
  
  const avatarPlaceholder = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  useEffect(() => {
    if (user) {
      setIsListingFiles(true);
      listUserFiles(user.uid)
        .then(setUploadedFiles)
        .finally(() => setIsListingFiles(false));
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (displayName === user?.displayName) return;

    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      await auth.currentUser.getIdToken(true);
      toast({
        title: 'Success',
        description: 'Your display name has been updated.',
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
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !auth.currentUser) {
      return;
    }

    setIsUploading(true);
    try {
      if (file.size > 1 * 1024 * 1024) {
        throw new Error('Image file is too large (max 1MB).');
      }

      const photoURL = await uploadProfileImage(file, user.uid);
      await updateProfile(auth.currentUser, { photoURL });
      
      await auth.currentUser.getIdToken(true);

      // Refresh the file list
      listUserFiles(user.uid).then(setUploadedFiles);

      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      });

    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message || "Failed to upload image.",
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
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
    <div className="flex-1 space-y-6">
      <h1 className="text-lg font-semibold md:text-2xl">User Profile</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                 <div className="relative">
                  {avatar && (
                      <Image
                        src={avatar.imageUrl}
                        width={80}
                        height={80}
                        alt={avatar.description}
                        className="rounded-full object-cover"
                        data-ai-hint={avatar.imageHint}
                      />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                 </div>
                 <div className="flex flex-col gap-2">
                   <Label htmlFor="photo-upload" className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isUploading ? 'disabled:opacity-50' :'bg-primary text-primary-foreground hover:bg-primary/90'} h-10 px-4 py-2`}>
                      {isUploading ? 'Uploading...' : 'Change Photo'}
                   </Label>
                   <Input id="photo-upload" type="file" className="hidden" onChange={handleFileSelect} accept="image/png, image/jpeg, image/gif" disabled={isUploading} />
                   <p className="text-xs text-muted-foreground">JPG, GIF, or PNG. 1MB max.</p>
                 </div>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled />
                  </div>
                  <Button type="submit" disabled={isSaving || displayName === user?.displayName}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
                <CardDescription>A list of all your uploaded avatars in Firebase Storage.</CardDescription>
            </CardHeader>
            <CardContent>
                {isListingFiles ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : uploadedFiles.length > 0 ? (
                    <ul className="space-y-3">
                        {uploadedFiles.map((file) => (
                            <li key={file.fullPath} className="flex items-center justify-between text-sm border-b pb-2">
                                <div className="flex items-center gap-3">
                                    <FileImage className="h-5 w-5 text-muted-foreground" />
                                    <span className="truncate">{file.name}</span>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`https://storage.googleapis.com/${file.bucket}/${file.fullPath}`} target="_blank" rel="noopener noreferrer">
                                        View
                                    </a>
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-foreground py-8">You haven&apos;t uploaded any files yet.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
