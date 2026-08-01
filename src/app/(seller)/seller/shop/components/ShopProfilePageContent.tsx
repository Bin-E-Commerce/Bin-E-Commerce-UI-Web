'use client';

import { useState } from 'react';

import { useShopProfile } from '../hooks/useShopProfile';
import { ShopBasicInfoPanel } from './ShopBasicInfoPanel';
import { ShopIdentityPanel } from './ShopIdentityPanel';
import { ShopProfileEditForm } from './ShopProfileEditForm';
import { ShopProfileHeader } from './ShopProfileHeader';
import {
    ShopProfileErrorState,
    ShopProfileSkeleton,
} from './ShopProfileState';
import {
    ShopProfileTabs,
    type ShopProfileTab,
} from './ShopProfileTabs';
import { ShopTaxInfoPanel } from './ShopTaxInfoPanel';

// Điều phối truy vấn, tab và chế độ chỉnh sửa; từng vùng nội dung được giao cho component chuyên trách.
export function ShopProfilePageContent() {
    const [activeTab, setActiveTab] = useState<ShopProfileTab>('basic');
    const {
        profileQuery,
        form,
        editing,
        categoryName,
        updateMutation,
        startEditing,
        cancelEditing,
        submit,
    } = useShopProfile();

    // Luôn đưa người dùng về tab thông tin cơ bản vì đây là nhóm duy nhất được phép chỉnh sửa trực tiếp.
    const handleStartEditing = () => {
        setActiveTab('basic');
        startEditing();
    };

    // Không cho chuyển nhóm trong lúc form mở để tránh làm mất ngữ cảnh của thay đổi chưa lưu.
    const handleTabChange = (tab: ShopProfileTab) => {
        if (!editing) setActiveTab(tab);
    };

    // Gọi refetch có chủ đích khi người dùng bấm thử lại hoặc làm mới từ header.
    const refreshProfile = () => {
        void profileQuery.refetch();
    };

    if (profileQuery.isLoading) {
        return <ShopProfileSkeleton />;
    }

    if (profileQuery.isError || !profileQuery.data) {
        return <ShopProfileErrorState onRetry={refreshProfile} />;
    }

    const profile = profileQuery.data;

    return (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
            <ShopProfileHeader
                profile={profile}
                editing={editing}
                refreshing={profileQuery.isFetching}
                onEdit={handleStartEditing}
                onRefresh={refreshProfile}
            />
            <ShopProfileTabs
                activeTab={activeTab}
                disabled={editing}
                onChange={handleTabChange}
            />

            <div role="tabpanel">
                {editing ? (
                    <ShopProfileEditForm
                        profile={profile}
                        categoryName={categoryName}
                        form={form}
                        saving={updateMutation.isPending}
                        onCancel={cancelEditing}
                        onSubmit={submit}
                    />
                ) : activeTab === 'basic' ? (
                    <ShopBasicInfoPanel
                        profile={profile}
                        categoryName={categoryName}
                    />
                ) : activeTab === 'tax' ? (
                    <ShopTaxInfoPanel profile={profile} />
                ) : (
                    <ShopIdentityPanel profile={profile} />
                )}
            </div>
        </div>
    );
}
